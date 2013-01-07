#spmbatch

遍历指定目录下的所有spm模块，并执行给定的spm命令。

##准备工作

请先安装spm(>=0.9.1)。

	$ spm -v
	$ v0.9.1

##使用

	$ spmbatch command [options]

* command：可使用build和upload命令，默认会以`spm build`和`spm upload`来执行。

* options（可选）：
	* [-d/--dir] 指定执行的目录
	* [-p/--process] 指定spm的进程，默认为`spm`
	* [-v/--version] 显示spmbatch版本
	* [--nolog] 不生成`.spm`日志文件

##.spm文件

可用于屏蔽命令的执行。当文件内容为`ignore`时，spmbatch将忽略其所在目录以及子目录的遍历。