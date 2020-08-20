# layuitable-expendRow
可以在layuitable中隐藏显示列（适用于smarty和接口访问列表）  
需要将example例子中的style样式复制到项目中公用的css文件中  
因为是额外的文件，所以需要加上配置  
layui.config({  
&nbsp;&nbsp;&nbsp;&nbsp;base: 'extends/'  
}).extend({  
&nbsp;&nbsp;&nbsp;&nbsp;expendrow: 'expendrow'  
})  
这一部分的配置详见layui官网。  
需要注意的是iconfont.css文件的引入，如果需要其他的图标，可以通过更改上文所说的css代码，引入自己所需要的图标。  
