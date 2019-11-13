Modules["LNK_v1.0"]=function(c){
	var ur=c.Web,rt="https://"+c.Url+ur.Root,cv=c.Vars,
	cfg={host:"https://"+c.Url,pub:rt,vid:rt+ur.Video,eps:rt+ur.Episodes,srch:rt+ur.Search,prg:rt+ur.Program,list:rt+ur.List,home:rt+ur.Home,feed:rt+ur.Feed},
	fRp=function(dt){if(dt.page>1&&dt.items.length<1){dt.page=1;}},
	fErr=function(cb){return function(a,msg){if(a){console.warn(a);}Popup(msg||"Tinklo klaida.").Show();cb(false);};},
	fSrt=function(i,p){return i.sort(function(a,b){return(a[p]>b[p])?1:((b[p]>a[p])?-1:0);});},
	fW=function(url,cb,f,data,e){var err=fErr(cb);XHR(url,function(a){try{f(a);}catch(r){err(r,e);}},data,err);},
	fPlay=function(cb,dt){fW(cfg.vid+"/"+dt.urlSegment+"/"+dt.id+"/true",cb,function(a){var v=a.videoConfig.videoInfo;AV.Open((v[cv.m3u8]?cfg.smil:cfg.mp4)+v.videoUrl+"/"+cv.pls+v[cv.tkn],v.title,cb);},0,"Programa nerasta.");},
	fEps=function(cb,dt){if(dt.page>1&&dt.items.length<1){dt.page=1;}fW(cfg.eps+"/"+dt.id+"/1/"+dt.page+"/",cb,function(a){fVids(cb,dt,a);});},
	fSr=function(cb,dt){fW(cfg.srch+"/"+encodeURIComponent(dt.query)+"/"+dt.page+"/",cb,function(a){fVids(cb,dt,a.components[0].component);});},
	fPrgID=function(cb,dt){var err=fErr(cb,dt);Input.Show("Programos ID: ",function(a){var id=parseInt(a);if(id){fW(cfg.prg+"/"+id,cb,function(a){if(a.program&&a.program.id===id){cb(oPrg({id:id,posterImage:a.program.coverImage,title:a.program.title}));}else{err("","Programa nerasta.");}},0,"Neteisingas programos ID.");}else if(a){err("","Neteisingas programos ID.");}else{cb(false);}});},
	fNext=function(cb,dt){var ltr=dt.pages.shift();if(!dt.pages.length){dt.more=false;}var f=function(itm){itm=fSrt(itm,"title");dt.items=dt.items.concat(itm);cb(itm);};fW(cfg.list+"?letter="+encodeURIComponent(ltr),cb,function(a){var i,itm=[];if(a.programList.length>=12){var len=dt.cnl.length,j=0,fl=function(b){for(var i in b.programList){var p=oPrg(b.programList[i]);itm.push(p);}j++;if(j>=len){f(itm);}};for(i in dt.cnl){fW(cfg.list+"?channelId="+dt.cnl[i]+"&letter="+ltr,cb,fl);}}else{for(i in a.programList){var p=oPrg(a.programList[i]);itm.push(p);}f(itm);}});},
	fList=function(cb,dt){if(dt.more){if(dt.pages.length){fNext(cb,dt);}else{fW(cfg.home,cb,function(a){for(var i in a.channels){dt.cnl.push(a.channels[i].id);}fW(cfg.list,cb,function(b){dt.pages=b.letters;fNext(cb,dt);});});}}else{setTimeout(function(){cb();},1000);}},
	fVids=function(cb,dt,a){var itm=[];for(var i in a.videos){itm.push(oEps(a.videos[i]));}if(a.pageLimit>a.videos.length){dt.more=false;}dt.items=dt.items.concat(itm);cb(itm);dt.page++;},
	fFd=function(cb,dt,f){fW(cfg.feed,cb,function(a){f(a);},{tagId:dt.id,pageIndex:dt.page});},
	fFeed=function(cb,dt){fRp(dt);fFd(cb,dt,function(a){fVids(cb,dt,a.components[0].component);});}, //TODO: Load old items.
	fFLst=function(cb,dt){fFd(cb,dt,function(a){var f=a.tagFilter;for(var i in f){dt.items.push(oFeedP(f[i].tag));}cb(dt.items);});},
	fMtk=function(cb){fW(cfg.home,cb,function(a){var itm=[oMtkC({id:0,title:"Visi Kanalai"})];for(var i in a.channels){itm.push(oMtkC(a.channels[i]));}cb(itm);});},
	fMtkP=function(cb,dt){fW(cfg.list+"?pageIndex=1"+(dt.id?"&channelId="+dt.id:""),cb,function(a){var itm=[oMtkL({id:0,title:"Visi įrašai",chn:dt.id})];for(var i in a.letters){itm.push(oMtkL({id:encodeURIComponent(a.letters[i]),title:a.letters[i],chn:dt.id}));}cb(itm);});},
	fMtkL=function(cb,dt){fRp(dt);fW(cfg.list+"?pageIndex="+dt.page+(dt.chn?"&channelId="+dt.chn:"")+(dt.id?"&letter="+dt.id:""),cb,function(a){fVids(cb,dt,a.videoGrid);});},

	fBase=function(cb){fW(cfg.pub+"/settings",cb,function(a){cfg.img=cfg.host+a.Portal_ImageFolder;cfg.vod=a.WowzaVodUrl;cfg.mp4=cfg.vod+a.WowzaVodContentPath;cfg.smil=cfg.vod+a.WowzaVodContentPathSmil;
		cb([oList(),oFeed(),oMtk(),oID()]);
	});},
	
	//TODO: /program-page - for details
	/* Episodes  */	
	oEps=function(dt){return {id:dt.id,title:dt.title,url:dt.urlSegment,image:cfg.img+dt.posterImage,duration:Hms(dt.duration,1),date:dt.airDateText,type:"grid",action:fPlay};},
	/* Program	 */	
	oPrg=function(dt){return {id:dt.id,page:1,image:cfg.img+dt.posterImage,title:dt.title,imgClass:null,type:"grid",items:[],more:true,action:fEps};},
	/* ProgramId */	
	oID=function(){return {id:1,title:"Atidaryti programą",type:"grid",items:[],action:fPrgID};},
	/* Search    */ 
	oSr=function(s){return {id:2,title:"Paieška: \""+s+"\"",query:s,page:1,type:"grid",more:true,action:fSr};},
	/* List      */	
	oList=function(){return {id:0,title:"Visos Laidos",type:"grid min",items:[],more:true,pages:[],cnl:[],action:fList};},
	/* Feed      */	
	oFeed=function(){return {id:ur.FeedTag,title:"Naujausi Video",page:1,type:"menu center",items:[],action:fFLst};},
	/* FeedPage  */	
	oFeedP=function(dt){return {id:dt.id||ur.FeedTag,title:dt.title,page:1,items:[],type:"grid",action:fFeed,more:true};},
	/* Mediateka */	
	oMtk=function(){return {id:ur.FeedTag,title:"Mediateka",page:1,type:"menu center",items:[],action:fMtk};},
	/* Channels  */ 
	oMtkC=function(dt){return {id:dt.id,title:dt.title,page:1,type:"grid min center",items:[],action:fMtkP};},
	/* Letters   */ 
	oMtkL=function(dt){return {id:dt.id,title:dt.title,page:1,chn:dt.chn,more:true,type:"grid",items:[],action:fMtkL};};

	return {items:[],more:false,title:c.Name,type:"menu center",image:cfg.host+c.Icon,selectFirst:true,moreHeight:c.moreHeight||1200,search:function(s,cb){cb(oSr(s));},action:fBase};
};
