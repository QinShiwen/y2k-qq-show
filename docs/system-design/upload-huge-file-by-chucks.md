# 断网之后，大文件怎么继续传完

英文版：[upload-huge-file-by-chunks.en.md](./upload-huge-file-by-chunks.en.md)

一个 3GB 的文件如果整包发出去，传到 90% 断线，就得从头再来。所以不要发一整包。浏览器每次只读出一段字节发出去，服务器用一张清单记住哪些段已经到了。断线之后，只补清单里没有的段。段都到齐，再按原来的顺序接回一个文件。

电脑上的原文件始终是一个文件。切段只是读取其中一段：

```text
video.mp4（3.1GB，仍是一个文件）
|-- 第1段 开头5MB --|-- 第2段 接着的5MB --| ... |-- 第640段 --|
```

两处存放的东西不一样：

```text
对象存储里是字节。传的过程中，每一段单独放：
  UPLOAD-12345/1
  UPLOAD-12345/2
  UPLOAD-12345/5

数据库里没有视频。只有一张清单，记录哪些段号已经到了：
  已到达 [1, 2, 5]
  所以第 3、4 段还要补
```

清单上的 `[1, 2, 5]` 就是段号。存储路径 `UPLOAD-12345/5` 就是第 5 段字节所在的位置。

## 一次上传怎么走完

```mermaid
sequenceDiagram
    actor User as 用户
    participant Browser as 浏览器
    participant Server as 服务器
    participant List as 数据库里的清单
    participant Store as 对象存储

    User->>Browser: 选中 video.mp4，约 3.1GB
    Browser->>Browser: 每段 5MB，共 640 段。原文件不拆开，只按字节范围读取

    Browser->>Server: 我要上传这个文件，这是名字和总大小
    Server->>List: 新建一张清单：编号 UPLOAD-12345，已到达的段号是空的
    Server->>Store: 留出一个位置，后面的每一段都放在这个编号下面
    Server-->>Browser: 编号、每段 5MB、目前到达的段号（还是空的）

    par 大约 4 段同时传
        Browser->>Browser: 读出第 n 段的字节
        Browser->>Server: 这是 UPLOAD-12345 的第 n 段
        Server->>Store: 把字节存到 UPLOAD-12345/n
        Store-->>Server: 存好了，并给出这段内容的校验值
        Server->>List: 清单加上 n
        Server-->>Browser: 第 n 段已收到
    end

    Note over Browser,List: 某一段的请求断了：清单不变。再问一次清单，只补没有的段号

    Browser->>Server: 640 段都到了，请接成原来的文件
    Server->>List: 确认清单里有 1 到 640
    Server->>Store: 按 1、2、3… 的顺序把各段接起来
    Store-->>Server: 得到 video.mp4，路径 uploads/UPLOAD-12345/video.mp4
    Server->>List: 这条上传改为完成，记下路径
    Server-->>Browser: 上传完成
```

顺着上面这张图：

1. 用户选文件。浏览器用「文件总大小 ÷ 每段大小」算出共有多少段。第 1 段是开头的 5MB，第 2 段是紧接着的 5MB，最后一段通常更短。
2. 浏览器把文件名和总大小告诉服务器。服务器做两件还没有视频内容的事：在数据库放一张空清单，在对象存储留一个编号，让后面的每一段有地方放。
3. 浏览器读出第 n 段的字节，和编号、段号一起发出去。大约 4 段一起传。段号就是这段在原文件里的顺序。
4. 对象存储把这段字节放在 `UPLOAD-12345/n`。存好后交回一个校验值，表示存下来的内容和发出去的一致。服务器把 n 写进清单。
5. 清单里有了 1 到 640，服务器让对象存储按段号把各段接成 `video.mp4`。数据库记下这个文件的路径。接好的那一份就是文件。

浏览器读出某一段，用的是字节范围，整份文件不会进内存：

```ts
const CHUNK_SIZE = 5 * 1024 * 1024;
const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

function sliceForChunk(file: File, chunkNumber: number): Blob {
  const start = (chunkNumber - 1) * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, file.size);
  return file.slice(start, end);
}
```

数据库里那一行，记的是进度，不是视频：

```ts
{
  id: "UPLOAD-12345", // 这一次上传的编号，后面每段请求都带上
  fileName: "video.mp4",
  fileSize: 3355443200,
  chunkSize: 5242880, // 每段 5MB。服务器定好，浏览器照这个长度读
  totalChunks: 640,
  arrived: [1, 2, 3, 4, 5], // 清单。只有段号，看它就知道缺哪一段
  checksums: {
    1: "a1b2", // 第 1 段的校验值，拼接时交给对象存储
    2: "c3d4"
  },
  status: "uploading", // 段还没齐。齐了并接好之后改为 completed
  filePath: "" // 接好之后才有，例如 uploads/UPLOAD-12345/video.mp4
}
```

## 页面刷新了

清单在服务器上，还在。浏览器里选中的那个文件会丢。

用户再选一次同一个文件。浏览器对一下文件名和大小，向服务器要清单，只发送清单里没有的段号。

## 同一段发出去两次

某一段其实已经存好了，但服务器的回复没回到浏览器，浏览器就会再发一次。续传时也可能把清单里已有的段号再发一遍。

第 n 段永远写在 `UPLOAD-12345/n`。再发一次，覆盖的是这一段。清单里的 n 还是只有一个。校验值换成这一次存好的结果。

所以完成与否看的是清单里有没有 1 到 640 的每一个号。同一段传两次，不会让清单多出一个号，也不会把缺的号补上。

## 每一段设多大

一段的大小，就是这次请求失败后要重传的量。

- 5MB、10MB 是常用值。断了重传的量不大，请求次数也能接受。
- 段太小，640 段会变成几千次请求。
- 段太大，失败一次就要重传很大一块。
- 这一段还要在超时前传完。手机网络慢，用 5MB 或 10MB。

对象存储还有三条界限：除最后一段外，每段至少 5MB；最多 1 万段；接好的文件最大 5TB。所以 5MB 一段时，文件大约到 50GB 还够用。文件更大，就把每段加大，让段数留在 1 万以内。

## 很多人同时在传

视频字节如果都穿过自己的服务器，带宽会先被打满。服务器只维护清单。

服务器确认这个用户可以传之后，给每一段发一个临时许可。浏览器用这个许可，把这段字节直接交给对象存储。存好后，浏览器把段号和校验值告诉服务器，服务器在清单上加上这个段号。

每个用户同时大约传 4 段。清单如果一天还没接完，就清掉对象存储里这些还没接上的段，避免半成品一直占空间。接成文件之后，再去做杀毒或转码。
