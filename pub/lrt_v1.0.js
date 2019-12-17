Modules.Include("LRT_v1.0",function(c){
	var ur=c.Web,rt="https://"+c.Url+ur.Root,
	fW=function(url,cb,f,data,e){var err=fErr(cb);XHR(url,function(a){try{f(a);}catch(r){err(r,e);}},data,err);},
	fErr=function(cb){return function(a,msg){if(a){console.warn(a);}Popup(msg||"Tinklo klaida.").Show();cb(false);};},
	fPl=function(cb,dt){
		fW(rt+"/article/"+dt.id,cb,function(a){
			fW(a.article.get_playlist_url,cb,function(b){
				AV.Open(b.playlist_item.file,b.title,cb,b.offset);
			},0,"Programa nerasta.");
		},0,"Programa nerasta.");
	},

	fMtk=function(cb,dt){
		console.log(arguments);
		fW(rt+"/search?type=3&page="+(dt.page||1)+(dt.query?"&q="+encodeURIComponent(dt.query):""),cb,function(a){
			var itm=[],b=a.items;
			for(var i in b){itm.push(oMti(b[i]));}
			dt.items=dt.items.concat(itm);
			if(itm.length<1){dt.more=false;}
			cb(itm);
		});
		dt.page++;
	},
	fBase=function(cb){cb([oMtk()]);},

	oMtk=function(){return {id:1,title:"Naujausi Video",page:1,type:"grid min",items:[],more:true,action:fMtk};},
	oMti=function(dt){
		var ttl = dt.title.indexOf(dt.category_title)?dt.category_title:dt.title,dsc=(ttl===dt.title?null:dt.title);
		return {
			id:dt.id,title:ttl,descr:dsc,type:"grid min",action:fPl,date:dt.date,
			image:"https://"+c.Url+dt.photo.replace("{WxH}","282x158"),cat:dt.category_id,};
	},
	oSr=function(s){return {id:2,title:"Paieška: \""+s+"\"",query:s,page:1,type:"grid min",more:true,action:fMtk};};
	return {items:[],more:false,title:c.Name,type:"menu center",
		imgClass:"img-svg img-svg-LRTlt-item",
		selectFirst:true,
		moreHeight:c.moreHeight||1200,search:function(s,cb){cb(oSr(s));},action:fBase};
});
