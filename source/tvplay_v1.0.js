Modules.Include("TVPlay_v1.0",function(c){
	var uic="https://"+c.Url+c.Icon;
	var cfg={
		img:"https://"+(c.UrlImage||c.Url)+"/thumbnails/320x180",
		host:"https://"+c.Url,pub:"https://"+c.Url+c.UrlRoot,title:c.Name,
		pageLG:30,pageSM:50,imageError:(c.IconItemSVG?"":uic),imgClass:(c.IconItemSVG?"img-svg img-svg-"+c.Name+"-item":""),
		uVer1:c.Version,uVer2:c.UrlRoot+"/videoContent/search?"+(c.Version2||c.Version),
		uBase:function(){return cfg.pub+"/dashboard/type/WEB?"+cfg.uVer1;},
		uEl1:function(id){return cfg.pub+"/dashboard/elements/"+id+"?"+cfg.uVer1;},
		uEl2:function(id,size,page){return cfg.pub+"/dashboard/carousel/elements/"+id+"?"+cfg.uVer1+"&detailed=true&size="+size+"&page="+page;},
		uTv:function(size,page){return cfg.host+cfg.uVer2+"sort=relevance&sort=title.title&size="+size+"&page="+page;},
		uTvq:function(query,size,page){return cfg.host+cfg.uVer2+"sort=relevance&f_title.titleORtitle.titleBriefORtitle.summaryShortORtitle.summaryLong="+encodeURIComponent(query)+"&size="+size+"&page="+page;},
	};
	var err=function(e){ //TODO: capture error;
		Popup("Error",e,null,{Type:"Error"});
	};
	
	var Play=function(url,title,descr,cb){AV.Open(url,title+(descr&&descr!==title?" - "+descr:""),cb);};
	var oTV=function(dt){
		var page=0,ret={
			id:dt.id,image:dt.noImage?null:(dt.imageUrl?cfg.img+dt.imageUrl+".jpg":cfg.imageError),
			title:dt.title.title||dt.title,descr:dt.title.titleBrief,parent:dt.parent,
			date:(dt.metadata||"").airDate||dt.createdDate,query:dt.query,
			season:dt.seasonNumber||(dt.metadata||"").seasonNumber,imgClass:dt.noImage?null:cfg.imgClass,
			duration:dt.title.runTime,summary:dt.title.summaryLong,
			type:dt.seasonNumber||(!dt.title.runTime&&!dt.tvSeasonUrls)?(!dt.seasonNumber?"grid min":"grid"):"list max",items:[],more:!dt.title.runTime&&!dt.tvSeasonUrls&&!dt.seasonNumber,
			action:function(cb){
				if(dt.title.runTime){XHR(cfg.host+dt.detailsUrl,function(a){ret.type="grid";Play(a.movie.contentUrl,ret.title,ret.descr,cb);},null,err);}
				else if (dt.seasonNumber){XHR(cfg.host+dt.episodeVodAssetsUrl+"&size=2000",function(a){
					for(var i in a.content){var d=a.content[i];if(d.title.title===ret.parent){d.title.title=d.title.titleBrief;}var b=new oTV(d);ret.items.push(b);}
					if(cb){cb(ret.items);}},null,err);}
				else if(dt.tvSeasonUrls){
					var f=function(a){c--;a.title.titleBrief="";a.parent=ret.title.substr(0,ret.title.indexOf(" ["));rd.push(new oTV(a));
						if(!c){if(rd&&rd.sort){rd.sort(function(a,b){return(a.season<b.season)?1:((b.season<a.season)?-1:0);});}ret.items=rd;if(cb){cb(rd);}}};
					var s=dt.tvSeasonUrls,c=s.length,rd=[];for(var i in s){XHR(cfg.host+s[i],f,null,err);}}
				else if(ret.more){var pi=cfg.pageSM;if(ret.more&&page*pi!==ret.items.length){page=0;ret.items=[];}XHR(ret.query?cfg.uTvq(ret.query,pi,page):cfg.uTv(pi,page),function(a){page++;var rd=[];if(a.length<pi){ret.more=false;}for(var i in a){var b=new oTV(a[i]);ret.items.push(b);rd.push(b);}if(cb){cb(rd);}},null,err);}
				else if(ret.items.length<1&&page>0){ret.more=true; page=0; return ret.action(cb);}
				else if(cb){cb();}
			},error:err
		};return ret;
	};

	var oBase=function(dt,lv){
		var page=0,ret={
			id:dt.targetId||dt.id,image:dt.contentUrl||dt.imageUrl?(dt.imageUrl?cfg.img+dt.imageUrl+".jpg":cfg.imageError):null,title:dt.title,
			descr:dt.subTitle,date:dt.eventStartTime,duration:Hms(dt.runTimeInSeconds,1),type:(lv===1?"grid":"menu center"),items:[],more:lv===1,
			action:function(cb){
				if(dt.contentUrl){Play(dt.contentUrl,ret.title,ret.descr,cb);ret.type="grid";}
				else if(lv===1){var pi=cfg.pageLG;if(page*pi!==ret.items.length){page=0;ret.items=[];}
					XHR(cfg.uEl2(dt.id,pi,page),function(a){page++;var rd=[];if(a.content.length<pi){ret.more=false;}for(var i in a.content){var b=new oBase(a.content[i]);ret.items.push(b);rd.push(b);}if(cb){cb(rd);}},null,err);}
				else if(dt.id){XHR(cfg.uEl1(dt.id),function(a){if(a&&a.sort){a.sort(function(a,b){return(a.position>b.position)?1:((b.position>a.position)?-1:0);});}for(var i in a){ret.items.push(new oBase(a[i].carousel,1));}if(cb){cb(ret.items);}},null,err);}
				else if(cb) {ret.type="grid";cb();
					//TODO: Drill season
					console.log("other");
				}
			},error:err
		};return ret;
	};

	var main={
		items:[],more:false,title:cfg.title,type:"menu center",
		selectFirst:true,moreHeight:c.moreHeight||1200,
		itemClass:c.IconItemSVG?" img-svg img-svg-"+c.Name+"-item":"",
		search: function(s,cb){
			cb(oTV({id:0,title:(s?"Laidos: \""+s+"\"":"Visos Laidos"),query:s,type:"grid",noImage:"none"}));
		},
		action: function(cb){
			XHR(cfg.uBase(),function(a){
				main.items=[new oTV({id:0,title:"Visos Laidos",type:"grid",noImage:"none"})];
				for(var i in a){main.items.push(oBase(a[i]));}if(cb){cb(main.items);}
			},null,err);
		},error:err
	};return main;
});
