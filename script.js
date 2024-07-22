let currentLanguage = 'estonian';
var inAadress = new InAadress({"container":"InAadressDiv","mode":3,"ihist":"1993","appartment":0,"lang":"et"});

function refreshInAadress() {
    var containerDiv = document.getElementById("InAadressDiv");
    containerDiv.innerHTML = '';
    if (currentLanguage === 'estonian') {
        var inAadress = new InAadress({
            "container": "InAadressDiv",
            "mode": 3,
            "ihist": "1993",
            "appartment": 0,
            "lang": "et"
        });
    } else {
        var inAadress = new InAadress({
            "container": "InAadressDiv",
            "mode": 3,
            "ihist": "1993",
            "appartment": 0,
            "lang": "en"
        });
    }
}

document.addEventListener('addressSelected', function(e){
  map.getView().animate({center: [e.detail[0].y,e.detail[0].x], resolution: 0.5, duration: 250});
});

var MouseMove_timer;
var SatList = {};
var Picker;
var ProductsWMS=['RGB','NRG','NDVI','NGR','NDPI','PNB','NGP','NDR','PDB','NDN','PDN','NNR','DNP'];
var ProductsTXT=['RGB','NRG','NDVI','NGR','NDPI','PNB','NGP','NDR','PDB','NDN','PDN','NNR','DNP'];
var ProductsInfo=['Satelliidifoto / Punane Roheline Sinine','Maakate-1 / Lähi-infrapuna Punane Roheline','Taimkate-1 /  NDVI','Metsanduslik / Lähi-infrapuna Roheline Punane','Veeindeks / NDPI','Maakate-2 / NDPI Lähi-infrapuna Sinine','Maakate-3 / Lähi-infrapuna Roheline NDPI','Taimkate-2 / Lähi-infrapuna NDVI Punane','Maakate-4 / NDPI NDVI Sinine','Taimkate-3 / Lähi-infrapuna NDVI Lähi-infrapuna','Maakate-5 / NDPI NDVI Lähi-infrapuna','Taimkate-4 / Lähi-infrapuna Lähi-infrapuna Punane','Maakate-6 / NDVI Lähi-infrapuna NDPI'];
var ProductsInfoEng = ['Satellite Image / Red Green Blue','Land Cover-1 / Near Infrared Red Green','Vegetation-1 / NDVI','Forestry / Near Infrared Green Red','Water Index / NDPI','Land Cover-2 / NDPI Near Infrared Blue','Land Cover-3 / Near Infrared Green NDPI','Vegetation-2 / Near Infrared NDVI Red','Land Cover-4 / NDPI NDVI Blue','Vegetation-3 / Near Infrared NDVI Near Infrared','Land Cover-5 / NDPI NDVI Near Infrared','Vegetation-4 / Near Infrared Near Infrared Red','Land Cover-6 / NDVI Near Infrared NDPI'];
var Product=[0,0];
var layerMSImode=[false,false];
var bands=[[1,2,3],[1,2,3]];
var gamma=[0,0];
var gammar=[0,0];
var gammag=[0,0];
var gammab=[0,0];
var lutarr=[[[0,31,63,95,127,159,191,223,255],[0,31,63,95,127,159,191,223,255],[0,31,63,95,127,159,191,223,255]],[[0,31,63,95,127,159,191,223,255],[0,31,63,95,127,159,191,223,255],[0,31,63,95,127,159,191,223,255]]];

var resample="bilinear";
document.getElementById('Resample').className=(resample=='nearest' ? 'buttonnoy' : 'buttonno');

var OrtoUrl=['https://kaart.maaamet.ee/wms/fotokaart','https://kaart.maaamet.ee/wms/alus','https://teenus.maaamet.ee/ows/wms-satiladu-ndvi','https://teenus.maaamet.ee/ows/wms-chm','https://teenus.maaamet.ee/ows/wms-chm','https://teenus.maaamet.ee/ows/wms-chm'];
var OrtoWMS=['EESTIFOTO','cir_ngr','NDVI_2021_suvi','CHM2018_suvi,CHM2019_suvi,CHM2020_suvi,CHM2021_suvi','CHM2012_kevad,CHM2012_suvi,CHM2013_kevad,CHM2013_suvi,CHM2014,CHM2015_kevad,CHM2015_suvi,CHM2017_suvi','CHM2008-11'];
var Orto=-1;

var MaskWMS=['puittaimestik','veekogu','margala','lage','taimestik_ule_10_m_2018-2021','taimestik_alla_1_m_2018-2021','taimestik_ule_10_m_2008-2020'];
var Mask=-1;

var BordersWMS=['katastriuksused','riigimetsaeraldised','erametsaeraldised','kaitsealad','kaitsemetsad','metsateatised','pollumassiivid','horisontaalid','pohikaart','mullatuubid'];
var Borders=-1;

var Hybrid=false;

var Sensors=['Sentinel-2'];
var Sensor=[0,0];

var MapOpener;

var MapHistory=[];
var MapHistoryNr=0;
var MapHistoryPush=false;

var sensedate=['0000-00-00','0000-00-00'];

var minimapCache=[];
var minimapimageWidth=0;
var minimapimageHeight=0;

var box;
var rot=0;

var witchActive=0;

var Etc=-1;
var deadtrees=-1;

var UrlParams={};
sURLVariables = decodeURIComponent(window.location.search.substring(1)).split('&');
for (i=0;i<sURLVariables.length;i++) {
  sParameterName = sURLVariables[i].split('=');
  if (sParameterName[0]!="") UrlParams[sParameterName[0]]=sParameterName[1];
}

if (UrlParams['date'] !== undefined) sensedate[0]=UrlParams['date'];
if (UrlParams['cdate'] !== undefined) sensedate[1]=UrlParams['cdate'];

if (UrlParams['sensor'] !== undefined) {
  for(i=0;i<Sensors.length;i++) {
    if (Sensors[i].toLowerCase()==UrlParams['sensor'].toLowerCase()) {
      Sensor[0]=i;
    }
  }
}

if (UrlParams['csensor'] !== undefined) {
  for(i=0;i<Sensors.length;i++) {
    if (Sensors[i].toLowerCase()==UrlParams['csensor'].toLowerCase()) {
      Sensor[1]=i;
    }
  }
}

if (UrlParams['rotation'] !== undefined) {
  rot=parseFloat(UrlParams['rotation'])*Math.PI/180;
  if (rot!=0)  document.getElementById('mapRotationDiv').className="buttonnoy";
}

if (UrlParams['mapbox'] !== undefined) {
  box=UrlParams['mapbox'].split(",");
} else {
  box=[277364,6360000,832636,6650000];
}

if (UrlParams['filter'] !== undefined) {
  for(i=0;i<ProductsWMS.length;i++) {
    if (ProductsWMS[i].toLowerCase()==UrlParams['filter'].toLowerCase()) {
      Product[0]=i;
    }
  }
  if (UrlParams['filter'].toLowerCase()=='msi') {
    if (UrlParams['bands'] !== undefined) {
      ibands=UrlParams['bands'].split(",");
      bands[0]=[parseInt(ibands[0]),parseInt(ibands[1]),parseInt(ibands[2])];

      document.getElementById('B1').value=bands[0][0];
      document.getElementById('B2').value=bands[0][1];
      document.getElementById('B3').value=bands[0][2];
    }
    if (UrlParams['curve'] !== undefined) {
      gamma[0]=parseInt(UrlParams['curve'])/100;
    }
    if (UrlParams['curver'] !== undefined) {
      gammar[0]=parseInt(UrlParams['curver'])/100;
    }
    if (UrlParams['curveg'] !== undefined) {
      gammag[0]=parseInt(UrlParams['curveg'])/100;
    }
    if (UrlParams['curveb'] !== undefined) {
      gammab[0]=parseInt(UrlParams['curveb'])/100;
    }
    if (!gamma[0]==0 || !gammar[0]==0 || !gammag[0]==0 || !gammab[0]==0) {
      document.getElementById('gamma').value=gamma[0];
      document.getElementById('gammar').value=gammar[0];
      document.getElementById('gammag').value=gammag[0];
      document.getElementById('gammab').value=gammab[0];
      document.getElementById('gammaTXT').innerHTML=Math.round(gamma[0]*100);
      document.getElementById('gammarTXT').innerHTML=Math.round(gammar[0]*100);
      document.getElementById('gammagTXT').innerHTML=Math.round(gammag[0]*100);
      document.getElementById('gammabTXT').innerHTML=Math.round(gammab[0]*100);
      setGamma(lutarr[0],gamma[0],gammar[0],gammag[0],gammab[0]);
    }
    layerMSImode[0]=true;
  }
  if (UrlParams['mapbox'] == undefined) {
    if (UrlParams['filter'].toLowerCase()=='msi') {
      document.getElementById('D-LutWindow').style.visibility='visible';
    } else {
      Hybrid=true;
      document.getElementById('HybridDiv').className="buttonnoy";
      startcompare();
    }
  }
}

lut1='';
lut2='';
lut3='';

for (i=0;i<9;i++) {
  lut1+=Math.max((i*32)-1,0) + ':' + Math.round(lutarr[0][0][i]) + ',';
  lut2+=Math.max((i*32)-1,0) + ':' + Math.round(lutarr[0][1][i]) + ',';
  lut3+=Math.max((i*32)-1,0) + ':' + Math.round(lutarr[0][2][i]) + ',';
}
inLut=[lut1.substring(0,lut1.length-1),lut2.substring(0,lut2.length-1),lut3.substring(0,lut3.length-1)];

if (UrlParams['cfilter'] !== undefined) {
  for(i=0;i<ProductsWMS.length;i++) {
    if (ProductsWMS[i].toLowerCase()==UrlParams['cfilter'].toLowerCase()) {
      Product[1]=i;
    }
  }
  if (UrlParams['cfilter'].toLowerCase()=='msi') {
    if (UrlParams['cbands'] !== undefined) {
      ibands=UrlParams['cbands'].split(",");
      bands[1]=[parseInt(ibands[0]),parseInt(ibands[1]),parseInt(ibands[2])];
    }
    if (UrlParams['ccurve'] !== undefined) {
      gamma[1]=parseInt(UrlParams['ccurve'])/100;
    }
    if (UrlParams['ccurver'] !== undefined) {
      gammar[1]=parseInt(UrlParams['ccurver'])/100;
    }
    if (UrlParams['ccurveg'] !== undefined) {
      gammag[1]=parseInt(UrlParams['ccurveg'])/100;
    }
    if (UrlParams['ccurveb'] !== undefined) {
      gammab[1]=parseInt(UrlParams['ccurveb'])/100;
    }
    if (!gamma[1]==0 || !gammar[1]==0 || !gammag[1]==0 || !gammab[1]==0) {
      setGamma(lutarr[1],gamma[1],gammar[1],gammag[1],gammab[1]);
    }
    layerMSImode[1]=true;
  }
}

clut1='';
clut2='';
clut3='';

for (i=0;i<9;i++) {
  clut1+=Math.max((i*32)-1,0) + ':' + Math.round(lutarr[1][0][i]) + ',';
  clut2+=Math.max((i*32)-1,0) + ':' + Math.round(lutarr[1][1][i]) + ',';
  clut3+=Math.max((i*32)-1,0) + ':' + Math.round(lutarr[1][2][i]) + ',';
}
inClut=[clut1.substring(0,clut1.length-1),clut2.substring(0,clut2.length-1),clut3.substring(0,clut3.length-1)];

var lutStr=[inLut,inClut];

if (UrlParams['hybrid'] !== undefined) {
  Hybrid=true;
  document.getElementById('HybridDiv').className="buttonnoy";
}

if (UrlParams['mask'] !== undefined) {
  Mask=UrlParams['mask'];
  document.getElementById('mask-' + Mask).className="buttonnoy";
}

if (UrlParams['borders'] !== undefined) {
  Borders=UrlParams['borders'];
  document.getElementById('borders-' + Borders).className="buttonnoy";
}

if (UrlParams['orto'] !== undefined) {
  Orto=UrlParams['orto'];
  document.getElementById('orto-' + Orto).className="buttonnoy";
}

if (UrlParams['points'] !== undefined) {
  Etc=UrlParams['points'];
  document.getElementById('etc-' + Etc).className="buttonnoy";
}

if (UrlParams['deadtrees'] !== undefined) {
  deadtrees=UrlParams['deadtrees'];
  document.getElementById('deadtrees').className="buttonnoy";
}

if (UrlParams['resample'] !== undefined) {
  resample=UrlParams['resample'];
//  document.getElementById('etc-' + Etc).className="buttonnoy";
}
function SenseDate(){
if (currentLanguage === 'estonian'){
document.getElementById('sensedate').innerHTML=sensedate[0] + ' &nbsp; ' + (!layerMSImode[0] ? ProductsTXT[Product[0]] : 'Kujundatud');
}
else{
document.getElementById('sensedate').innerHTML=sensedate[0] + ' &nbsp; ' + (!layerMSImode[0] ? ProductsTXT[Product[0]] : 'Designed');
}
if (sensedate[1]!='0000-00-00') {
  if (currentLanguage === 'estonian'){
  document.getElementById('comparesensedate').innerHTML=sensedate[1] + ' &nbsp; ' + (!layerMSImode[1] ? ProductsTXT[Product[1]] : 'Kujundatud');
  }
  else{
    document.getElementById('comparesensedate').innerHTML=sensedate[1] + ' &nbsp; ' + (!layerMSImode[1] ? ProductsTXT[Product[1]] : 'Designed');
  }
  document.getElementById('comparediv').style.visibility='visible';
}

if (sensedate[0]!='0000-00-00') {
  document.title=sensedate[0] + ' ' + Sensors[Sensor[0]] + ' ' + (!layerMSImode[0] ? ProductsWMS[Product[0]] : 'MSI');
  if (currentLanguage === 'estonian'){
  document.getElementById('notice').innerHTML="Maa-amet &nbsp; / &nbsp; ESTHub &nbsp; / &nbsp; Contains modified Copernicus Sentinel data " + sensedate[0].substring(0,4);
  }
  else{
  document.getElementById('notice').innerHTML="Estonian Land Board &nbsp; / &nbsp; ESTHub &nbsp; / &nbsp; Contains modified Copernicus Sentinel data " + sensedate[0].substring(0,4);
  }
}
if (currentLanguage === 'estonian'){
document.getElementById('product').innerHTML=Sensors[Sensor[0]] + ' &nbsp; ' + (!layerMSImode[0] ? ProductsTXT[Product[0]] : 'Kujundatud');}
else{
document.getElementById('product').innerHTML=Sensors[Sensor[0]] + ' &nbsp; ' + (!layerMSImode[0] ? ProductsTXT[Product[0]] : 'Designed');
}
}
SenseDate();
createProductListDiv();


var extent = [40500, 5993000, 1064500, 7017000];
var center = [568884,6514600];
var projection = new ol.proj.Projection({
  code: 'EPSG:3301',
  extent: extent,
  units: 'm',
  axisOrientation: 'up'
});

var Hybrid_resolutions = new Array(4000,2000,1000,500,250,125,62.5,31.25,15.625,7.8125,3.90625,1.953125,0.9765625,0.48828125,0.244140625);
var Hybrid_tileGrid = new ol.tilegrid.TileGrid({
  extent: extent,
  resolutions: Hybrid_resolutions,
  tileSize: [256, 256]
});

var Sat_resolutions = new Array(2560,1280,640,320,160,80,40,20,10,5,2.5,1.25,0.625,0.3125);
var Satextent = [-75000,5865000,1235000,7175000];
var Sat_tileGrid = new ol.tilegrid.TileGrid({
  extent: Satextent,
  resolutions: Sat_resolutions,
  tileSize: [512, 512]
});

var Hybrid_tile = new ol.layer.Tile({
  preload: 1,
  visible : (Hybrid),
  source: new ol.source.XYZ({
    tileGrid: Hybrid_tileGrid,
    crossOrigin: 'anonymous',
    projection: 'EPSG:3301',
    url: 'https://tiles.maaamet.ee/tm/tms/1.0.0/hybriid@LEST/{z}/{x}/{-y}.jpg&ASUTUS=Maa-amet&ENV=ehmapserver',
    ratio: 1
  })
});

var layerSAT=[

new ol.layer.Tile({
  preload: 0,
  extent: extent,
  visible : (sensedate[0]!='0000-00-00'),
  source: new ol.source.TileWMS({
    url: 'https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[0]].toLowerCase() + '-' + ProductsWMS[Product[0]].toLowerCase(),
    params: {
      'LAYERS': Sensors[Sensor[0]].replace('-','_').toLowerCase() + '_' + ProductsWMS[Product[0]].toLowerCase(),
      'FORMAT': 'image/jpeg',
      'VERSION':'1.1.1',
      'TILED': true,
      'resample': resample,
      'TRANSPARENT': false,
      'date': sensedate[0],
    },
    tileGrid: Sat_tileGrid,
    crossOrigin: 'anonymous',
    serverType: 'mapserver',
  })
}),

new ol.layer.Tile({
  preload: 0,
  extent: extent,
  visible : false,
  source: new ol.source.TileWMS({
    url: 'https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[1]].toLowerCase() + '-' + ProductsWMS[Product[1]].toLowerCase(),
    params: {
      'LAYERS': Sensors[Sensor[1]].replace('-','_').toLowerCase() + '_' + ProductsWMS[Product[1]].toLowerCase(),
      'FORMAT': 'image/jpeg',
      'VERSION':'1.1.1',
      'TILED': true,
      'resample': resample,
      'TRANSPARENT': false,
      'date': sensedate[1],
    },
    tileGrid: Sat_tileGrid,
    crossOrigin: 'anonymous',
    serverType: 'mapserver',
  })
})
];

var layerMSI=[

new ol.layer.Tile({
    preload: 0,
    extent: extent,
    visible : false,
    source: new ol.source.TileWMS({
      url: 'https://teenus.maaamet.ee/ows/wms-sentinel-2-msi',
      params: {
        'LAYERS': 'sentinel_2_msi',
        'FORMAT': 'image/jpeg',
        'VERSION':'1.1.1',
        'TILED': true,
        'TRANSPARENT': false,
        'date': sensedate[0],
        'bands': bands[0],
        'lut1': lutStr[0][0],
        'lut2': lutStr[0][1],
        'lut3': lutStr[0][2],
      },
      tileGrid: Sat_tileGrid,
      crossOrigin: 'anonymous',
      serverType: 'mapserver',
    })
}),

new ol.layer.Tile({
    preload: 0,
    extent: extent,
    visible : false,
    source: new ol.source.TileWMS({
      url: 'https://teenus.maaamet.ee/ows/wms-sentinel-2-msi',
      params: {
        'LAYERS': 'sentinel_2_msi',
        'FORMAT': 'image/jpeg',
        'VERSION':'1.1.1',
        'TILED': true,
        'TRANSPARENT': false,
        'date': sensedate[1],
        'bands': bands[1],
        'lut1': lutStr[1][0],
        'lut2': lutStr[1][1],
        'lut3': lutStr[1][2],
      },
      tileGrid: Sat_tileGrid,
      crossOrigin: 'anonymous',
      serverType: 'mapserver',
    })
})
];

var layerOrto = new ol.layer.Tile({
  preload: 0,
  extent: extent,
  visible : (Orto>-1),
  maxResolution: 60,
  source: new ol.source.TileWMS({
    url: OrtoUrl[''+Orto+''],
    params: {
      'LAYERS': OrtoWMS[''+Orto+''],
      'FORMAT': 'image/jpeg',
      'VERSION':'1.1.1',
      'TILED': true,
      'TRANSPARENT': false,
    },
    tileGrid: Sat_tileGrid,
    crossOrigin: 'anonymous',
    serverType: 'mapserver',
    gutter: 15,
  })
});

var layerDeadtrees = new ol.layer.Tile({
  preload: 0,
  extent: extent,
  visible : (deadtrees==1),
  source: new ol.source.TileWMS({
    url: 'https://teenus.maaamet.ee/ows/ai_tuletised',
    params: {
      'LAYERS': 'ai_surnud_puud',
      'FORMAT': 'image/png',
      'VERSION':'1.1.1',
      'TILED': true,
      'TRANSPARENT': true,
    },
    tileGrid: Sat_tileGrid,
    crossOrigin: 'anonymous',
    serverType: 'mapserver',
//    gutter: 15,
  })
});

var layerMask = new ol.layer.Tile({
  preload: 0,
  extent: extent,
  visible : (Mask>-1),
  maxResolution: 120,
  source: new ol.source.TileWMS({
    url: 'https://teenus.maaamet.ee/ows/wms-mask',
    params: {
      'LAYERS': MaskWMS[''+Mask+''],
      'FORMAT': 'image/png',
      'VERSION':'1.1.1',
      'TILED': true,
      'TRANSPARENT': true,
    },
    tileGrid: Sat_tileGrid,
    crossOrigin: 'anonymous',
    serverType: 'mapserver',
    gutter: 15,
  })
});

var layerBorders = new ol.layer.Tile({
  preload: 0,
  extent: extent,
  visible : (Borders>-1),
  maxResolution: 7.5,
  source: new ol.source.TileWMS({
    url: 'https://teenus.maaamet.ee/ows/wms-satiladu',
    params: {
      'LAYERS': BordersWMS[''+Borders+''],
      'FORMAT': 'image/png',
      'VERSION':'1.1.1',
      'TILED': true,
      'TRANSPARENT': true,
    },
    tileGrid: Sat_tileGrid,
    crossOrigin: 'anonymous',
    serverType: 'mapserver',
    mode: 'tiled',
    gutter: 0,
  })
});

const layerEtc = new ol.layer.Vector({
  preload: 0,
  extent: extent,
  visible: (Etc>-1),
  maxResolution: 7.5,
  source: new ol.source.Vector({
    strategy: ol.loadingstrategy.bbox,
    format: new ol.format.GeoJSON(),
    crossOrigin: 'anonymous',
  }),
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Stroke({color: 'white'}),
      stroke: new ol.style.Stroke({color: 'black', width: 3}),
    }),
  }),
});


const accuracyFeature = new ol.Feature();

const positionFeature = new ol.Feature();
positionFeature.setStyle(
  new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#3399CC',
      }),
      stroke: new ol.style.Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

const PositionLayer = new ol.layer.Vector({
  visible: false,
  source: new ol.source.Vector({
    features: [accuracyFeature, positionFeature],
  }),
});


var CmsLayerGroup = new ol.layer.Group({
  visible: true,
  layers:[],
});

var ClmsLayerGroup = new ol.layer.Group({
  visible: true,
  layers:[],
});

let map = new ol.Map({
  target: 'map',
  interactions: ol.interaction.defaults({
    doubleClickZoom: true,
    dragAndDrop: false,
    dragPan: true,
    dragRotate: false,
    keyboardPan: true,
    keyboardZoom: true,
    mouseWheelZoom: true,
    pointer: false,
    select: false,
    shiftDragZoom:true,
    dragPan:true,
    pinchRotate:true,
    pinchZoom:true
  }),
  controls: [],
  layers: [layerSAT[0],layerMSI[0],layerSAT[1],layerMSI[1],CmsLayerGroup,ClmsLayerGroup,layerOrto,layerMask,layerBorders,Hybrid_tile,layerDeadtrees,layerEtc,PositionLayer],
  view: new ol.View({
    center: center,
    projection:projection,
    enableRotation: true,
    minResolution: 0.3125,
    constrainResolution: false
  })
});

map.getView().fit(box);
map.getView().setRotation(rot);
MapHistory.push([map.getView().getCenter(),map.getView().getResolution(),map.getView().getRotation()]);


function onMoveEnd(hist) {
  document.getElementById('LutDiv').className=(layerMSImode[witchActive] ? "buttonnoy" : "buttonno");

  if (map.getView().getResolution()>120) {
    document.getElementById('MaskDiv').className="buttonnog";
  } else {
    document.getElementById('MaskDiv').className=(Mask==-1?"buttonno":"buttonnoy");
  }

  if (map.getView().getResolution()>60) {
    document.getElementById('OrtoDiv').className="buttonnog";

  } else {
    if (Orto == -1) {
      document.getElementById('OrtoDiv').className="buttonno";

      layerSAT[0].setVisible(witchActive==0 && !layerMSImode[0]);
      layerMSI[0].setVisible(witchActive==0 && layerMSImode[0]);
      layerSAT[1].setVisible(witchActive==1 && !layerMSImode[1]);
      layerMSI[1].setVisible(witchActive==1 && layerMSImode[1]);

      layerOrto.setVisible(false);

    } else {
      document.getElementById('OrtoDiv').className="buttonnoy";

      layerOrto.setVisible(true);

      layerSAT[0].setVisible(false);
      layerMSI[0].setVisible(false);
      layerSAT[1].setVisible(false);
      layerMSI[1].setVisible(false);
    }
  }

  if (map.getView().getResolution()>7.5) {
    document.getElementById('BordersDiv').className="buttonnog";
    document.getElementById('EtcDiv').className="buttonnog";

    layerSAT[0].setVisible(witchActive==0 && !layerMSImode[0]);
    layerMSI[0].setVisible(witchActive==0 && layerMSImode[0]);
    layerSAT[1].setVisible(witchActive==1 && !layerMSImode[1]);
    layerMSI[1].setVisible(witchActive==1 && layerMSImode[1]);

    layerEtc.setVisible(false);

  } else {
    document.getElementById('BordersDiv').className=(Borders==-1?"buttonno":"buttonnoy");
    document.getElementById('EtcDiv').className=(Etc==-1?"buttonno":"buttonnoy");

    if (Etc > -1) {
      loadEtcVector(Etc);
      layerEtc.setVisible(true);
    }
  }

  if (map.getView().getResolution()>3.75) {
    document.getElementById('borders-9').className=(Borders==9?"buttonnoy":"buttonnog");
  } else {
    document.getElementById('borders-9').className=(Borders==9?"buttonnoy":"buttonno");
  }


  if (map.getView().getRotation()>=(2*Math.PI)) map.getView().setRotation(map.getView().getRotation()-(2*Math.PI));
  if (map.getView().getRotation()<=-(2*Math.PI)) map.getView().setRotation(map.getView().getRotation()+(2*Math.PI));

  var Vextent = map.getView().calculateExtent(map.getSize());
  var Vcenter = map.getView().getCenter();
  var Vsize = map.getSize();
  var Vresolution = map.getView().getResolution();
  var Vrotation = map.getView().getRotation()*180/Math.PI;
  if (Vrotation<0) Vrotation = (360+Vrotation);

  if (MapHistoryPush && hist && !(Vcenter==MapHistory[(MapHistory.length-1)][0] && Vresolution==MapHistory[(MapHistory.length-1)][1] && map.getView().getRotation()==MapHistory[(MapHistory.length-1)][2])) {
    if (MapHistoryNr<MapHistory.length-1) MapHistory = MapHistory.slice(0,(MapHistoryNr+1))
    MapHistoryNr=MapHistory.length;
    MapHistory.push([Vcenter,Vresolution,map.getView().getRotation()]);
    document.getElementById('NavPrev').className="buttonno";
    document.getElementById('NavNext').className="buttonnog";
  }
  MapHistoryPush=true;

  var VCextent=[Vcenter[0]-((Vsize[0]/2)*Vresolution),Vcenter[1]-((Vsize[1]/2)*Vresolution),Vcenter[0]+((Vsize[0]/2)*Vresolution),Vcenter[1]+((Vsize[1]/2)*Vresolution)];

  if (typeof (history.pushState) != "undefined") {
    for (i=0;i<Vextent.length;i++) {
      Vextent[i]=Math.round(Vextent[i]);
    }
    for (i=0;i<VCextent.length;i++) {
      VCextent[i]=Math.round(VCextent[i]);
    }
    var newurl=window.location.pathname;
    if (sensedate[witchActive]!='0000-00-00') {
      if (!layerMSImode[witchActive]) {
        filterStr='&filter=' + ProductsWMS[Product[witchActive]].toLowerCase();
      } else {
        filterStr='&filter=msi' + '&bands=' + layerMSI[witchActive].getSource().getParams()['bands'] + '&curve=' + Math.round(gamma[witchActive]*100) + '&curver=' + Math.round(gammar[witchActive]*100) + '&curveg=' + Math.round(gammag[witchActive]*100) + '&curveb=' + Math.round(gammab[witchActive]*100) + '&lut1=' + lutStr[witchActive][0] + '&lut2=' + lutStr[witchActive][1] + '&lut3=' + lutStr[witchActive][2];
      }
      newurl += '?sensor=' + Sensors[Sensor[witchActive]].toLowerCase() + filterStr + '&date=' + sensedate[witchActive];
    }
    witchNotActive=(witchActive==0 ? 1 : 0);
    if (sensedate[witchNotActive]!='0000-00-00' && !(sensedate[0]==sensedate[1] && (!layerMSImode[0] && !layerMSImode[1] && Product[0]==Product[1] || layerMSImode[0] && layerMSImode[1] && bands[0][0]==bands[1][0] && bands[0][1]==bands[1][1] && bands[0][2]==bands[1][2] && lutStr[0][0]==lutStr[1][0] && lutStr[0][1]==lutStr[1][1] && lutStr[0][2]==lutStr[1][2]) && Sensors[Sensor[0]]==Sensors[Sensor[1]])) {
      if (!layerMSImode[witchNotActive]) {
        cfilterStr='&cfilter=' + ProductsWMS[Product[witchNotActive]].toLowerCase();
      } else {
        cfilterStr='&cfilter=msi' + '&cbands=' + layerMSI[witchNotActive].getSource().getParams()['bands'] + '&ccurve=' + Math.round(gamma[witchNotActive]*100) + '&ccurver=' + Math.round(gammar[witchNotActive]*100) + '&ccurveg=' + Math.round(gammag[witchNotActive]*100) + '&ccurveb=' + Math.round(gammab[witchNotActive]*100) + '&clut1=' + lutStr[witchNotActive][0] + '&clut2=' + lutStr[witchNotActive][1] + '&clut3=' + lutStr[witchNotActive][2];
      }
      newurl += '&csensor=' + Sensors[Sensor[witchNotActive]].toLowerCase() + cfilterStr + '&cdate=' + sensedate[witchNotActive];
    }

    if (Hybrid) {
      newurl += '&hybrid=1';
    }

    if (Mask>-1) {
      newurl += '&mask=' + Mask;
    }

    if (resample!='bilinear') {
      newurl += '&resample=' + resample;
    }

    if (Borders>-1) {
      newurl += '&borders=' + Borders;
    }

    if (Orto>-1) {
      newurl += '&orto=' + Orto;
    }

    if (Etc>-1) {
      newurl += '&points=' + Etc;
    }

    if (deadtrees==1) {
      newurl += '&deadtrees=1';
    }

    newurl += '&mapbox=' + VCextent.join(",");
    if (Vrotation!=0) newurl += '&rotation=' + Vrotation.toFixed(2);
    history.replaceState('current', '',newurl);

  }
  minimapCache=[];

  var pxSize=map.getView().getResolution();
  var emOne=(pxSize * (document.getElementById('HybridDiv').offsetWidth/4));
  var sWidth=emOne*7;
  var sClosest=Math.pow(10, Math.round(Math.log10(sWidth)));

  var sWidth=(sClosest/emOne);
  if (sWidth<5) sWidth=sWidth*2;
  if (sWidth>18) sWidth=sWidth/4;
  if (sWidth>9) sWidth=sWidth/2;

  sWidthM=Math.round(sWidth*emOne)

  document.getElementById('scaleline').style.width=sWidth + 'em';
  document.getElementById('scaleline').innerHTML=(sWidthM<1000 ? sWidthM + ' m' : (sWidthM/1000) + ' km');
}

map.on('moveend', function () {
  onMoveEnd(true);
});


function onClick(Dexept) {
  for (div of document.getElementsByTagName("div")) {
    if (div.id.startsWith("D-")) {
      if (Dexept==div.id) {
        div.style.visibility=(div.style.visibility==='hidden' ? 'visible' : 'hidden');
      } else {
        div.style.visibility='hidden';
      }
    }
  }
  if (typeof(picker) !== 'undefined') picker.hide();
}

map.on('click', onClick);
map.on('movestart', onClick);

var onRotateTimeout;

function onRotate() {
  document.getElementById('mapRotationImage').style.transform='rotate(' + map.getView().getRotation()  + 'rad)';

  if (map.getView().getRotation()==0) {
    document.getElementById('mapRotationDiv').className="buttonno";
  } else {
    document.getElementById('mapRotationDiv').className="buttonnoy";
  }
}

map.getView().on('change:rotation', onRotate);



document.getElementById('export-png').addEventListener('click', function() { downloadPNG(false);});
document.getElementById('export-pgw').addEventListener('click', function() { downloadPNG(true); });


function downloadPNG(pgw) {
  map.once('rendercomplete', function() {
    document.getElementById('D-SaveMap').style.visibility='hidden';
    var mapCanvas = document.createElement('canvas');
    var size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    var mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
      if (canvas.width > 0) {
        var opacity = canvas.parentNode.style.opacity;
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
        var transform = canvas.style.transform;
        var matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
        mapContext.drawImage(canvas, 0, 0);
      }
    });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
    } else {
      tmpToday = new Date();
      tmpDate = tmpToday.getFullYear() + '-' + ('0' + (tmpToday.getMonth()+1)).slice(-2) + '-' + ('0' + tmpToday.getDate()).slice(-2) + '-' + ('0' + tmpToday.getHours()).slice(-2) + '-' + ('0' + tmpToday.getMinutes()).slice(-2) + '-' + ('0' + tmpToday.getSeconds()).slice(-2);

      if (pgw) {
        tmpUpperLeft=map.getCoordinateFromPixel([0.5,0.5]);
        tmpGSD=map.getView().getResolution();
        tmpRotation=map.getView().getRotation();
      }

      imglink = document.getElementById('image-download');
      imglink.download = Sensors[Sensor[witchActive]] + ' ' + (!layerMSImode[witchActive] ? ProductsWMS[Product[witchActive]] : 'MSI') + ' ' + sensedate[witchActive] + ' @ ' + tmpDate + '.png';

      imglink.href = mapCanvas.toDataURL();
      imglink.click();

      if (pgw) {
        A=tmpGSD*Math.cos(tmpRotation);
        D=tmpGSD*Math.sin(tmpRotation);
        B=tmpGSD*Math.sin(tmpRotation);
        E=-tmpGSD*Math.cos(tmpRotation);
        C=tmpUpperLeft[0];
        F=tmpUpperLeft[1];

        tfwlink = document.getElementById('tfw-download');
        tfwlink.download = Sensors[Sensor[witchActive]] + ' ' + (!layerMSImode[witchActive] ? ProductsWMS[Product[witchActive]] : 'MSI') + ' ' + sensedate[witchActive] + ' @ ' + tmpDate + '.pgw';
        tfwtext = A + '\n' + D + '\n' + B + '\n' + E + '\n' + C + '\n' + F + '\n';
        tfwdata = new Blob([tfwtext], {type: 'text/plain'});
        tfwurl = window.URL.createObjectURL(tfwdata);
        tfwlink.href = tfwurl;
        tfwlink.click();
      }
    }
  });
  map.renderSync();
}

var messageTimeout;

function showMessage(status,text) {
  document.getElementById('MessageText').innerHTML=text;
  document.getElementById('D-MessageWindow').style.visibility='visible';
  clearTimeout(messageTimeout);
  messageTimeout=setTimeout(() => { document.getElementById('D-MessageWindow').style.visibility='hidden'; }, 3000);
}



function copy_to_clipboard(what) {
  if (what=='wms') {
    if (layerMSImode[witchActive]) {
      MapLink=layerMSI[witchActive].getSource().getUrls()[0] + '?date=' + sensedate[witchActive] + '&layers=' + layerMSI[witchActive].getSource().getParams()['LAYERS'] + '&resample=' + layerMSI[witchActive].getSource().getParams()['resample'] + '&bands=' + layerMSI[witchActive].getSource().getParams()['bands'] + '&lut1=' + layerMSI[witchActive].getSource().getParams()['lut1'] + '&lut2=' + layerMSI[witchActive].getSource().getParams()['lut2'] + '&lut3=' + layerMSI[witchActive].getSource().getParams()['lut3'];
    } else {
      MapLink=layerSAT[witchActive].getSource().getUrls()[0] + '?date=' + sensedate[witchActive] + '&layers=' + layerSAT[witchActive].getSource().getParams()['LAYERS'] + '&resample=' + layerSAT[witchActive].getSource().getParams()['resample'];
    }
    navigator.clipboard.writeText(MapLink).then(() => {
      if (currentLanguage === 'estonian'){
      showMessage(0,"WMS link kopeeritud vahem&auml;llu.");
      }
      else{showMessage(0,"WMS link copied to clipboard.");}
    },() => {
      if (currentLanguage === 'estonian'){
      showMessage(1,"Kahjuks ei õnnestu WMS lingi aadressi vahem&auml;llu kopeerida <br><br>" + err);
      }
      else{showMessage(1,"Unfortunately it's not possible to copy the WMS link to clipboard <br><br>" + err);}
    });
  } else if (what=='url') {
    MapLink=window.location.href;
    navigator.clipboard.writeText(MapLink).then(() => {
      if (currentLanguage === 'estonian'){
      showMessage(0,"Kaardi aadress kopeeritud vahem&auml;llu.");
      }
      else{showMessage(0,"Card address copied to the clipboard");}
    },() => {
      if (currentLanguage === 'estonian'){
      showMessage(1,"Kahjuks ei õnnestu kaardi aadressi vahem&auml;llu kopeerida <br><br>" + err);
      }
      else{showMessage(1,"Unfortunately it's not possible to copy the card address to the clipboard <br><br>" + err);}
    });
  } else if (what=='img') {
    map.once('rendercomplete', function() {
      var mapCanvas = document.createElement('canvas');
      var size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      var mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
        if (canvas.width > 0) {
          var opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          var transform = canvas.style.transform;
          var matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          mapContext.drawImage(canvas, 0, 0);
        }
      });
      mapCanvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(() => {
        if (currentLanguage === 'estonian'){
        showMessage(0,"Kaardipilt kopeeritud vahem&auml;llu.");
        }
        else{showMessage(0,"Card photo copied to the clipboard");}
      },() => {
        if (currentLanguage === 'estonian'){
        showMessage(1,"Kahjuks &otilde;nnestu kaardipilti vahem&auml;llu kopeerida <br><br>" + err);
        }
        else{showMessage(1,"Unfortunately it's not possible to copy the card photo to the clipboard <br><br>" + err);}
      }));
    });
    map.renderSync();
  }
}



function startcompare() {
  document.getElementById('kuupaevdiv').removeAttribute("onclick");

  var oReq = new XMLHttpRequest();
  oReq.onload = function(e) {
    SatList = JSON.parse(oReq.responseText);

    var minDate='9999-99-99';
    var maxDate='0000-00-00';

    for ([key,value] of Object.entries(SatList)) {
      if (value['date']>maxDate) maxDate=value['date'];
      if (value['date']<minDate) minDate=value['date'];
    }

    startdatesplit=minDate.split('-');
    startDate = new Date(parseInt(startdatesplit[0]), parseInt(startdatesplit[1])-1, parseInt(startdatesplit[2]), 0, 0, 0, 0);
    enddatesplit=maxDate.split('-');
    endDate = new Date(parseInt(enddatesplit[0]), parseInt(enddatesplit[1])-1, parseInt(enddatesplit[2]), 0, 0, 0, 0);
    currDate = startDate;

    var dateDisableArray = [];

    while (currDate<=endDate) {
      dateDisableArray.push(currDate.getFullYear() + '-' + ('0'+(currDate.getMonth()+1)).substr(-2) + '-' + ('0'+currDate.getDate()).substr(-2));
      currDate.setDate(currDate.getDate() + 1);
    }

    for ([key,value] of Object.entries(SatList)) {
      delArrayIndex=dateDisableArray.indexOf(value['date']);
      if (delArrayIndex>-1) {
        dateDisableArray.splice(delArrayIndex,1);
      }
    }

    picker = new Lightpick({
      field: document.getElementById('kuupaevdiv'),
      format: 'YYYY-MM-DD',
      lang: 'et',
      firstDay: 1,
      numberOfMonths: 1,
      autoclose: true,
      hideOnBodyClick: true,
      orientation: 'top',
      minDate: minDate,
      maxDate: maxDate,
      disableDates: dateDisableArray,
      locale: {
        buttons: {
          prev: '<',
          next: '>',
          close: '\D7',
          reset: 'Reset',
          apply: 'Apply'
       }
     },
     dropdowns: {
       years: {
         min: startdatesplit[0],
         max: null
       },
       months: true,
     },
     onSelect: function(date){
       if (date.format('YYYY-MM-DD')==sensedate[witchActive]) return;
       setsensdateexact(date.format('YYYY-MM-DD'));
     },
     onOpen: function(date){
       minimapCache=[];
       setOrto(-1);
       onclick('none');
     },
     onClose: function(){
       document.getElementById("minimap").style.display='none';
     }
    });

    picker.setDate(sensedate[0]);
    picker.show();
  }
  oReq.open("GET", "https://geoportaal.maaamet.ee/index.php?page_id=733&kuupaev_algus=2000-01-01&kuupaev_lopp=2030-12-31&formaat=json");
  oReq.send();
}

let currentDate = '0000-00-00';
function setsensdateexact(newdate) {
  for ([key,value] of Object.entries(SatList)) {
    if (value['date']==newdate) {
      sensedate[witchActive]=newdate;
      if (currentLanguage === 'estonian'){
      document.getElementById('sensedate').innerHTML=sensedate[witchActive] + ' &nbsp; ' + (!layerMSImode[witchActive] ? ProductsTXT[Product[witchActive]] : 'Kujundatud');
      }
      else{
        document.getElementById('sensedate').innerHTML=sensedate[witchActive] + ' &nbsp; ' + (!layerMSImode[witchActive] ? ProductsTXT[Product[witchActive]] : 'Designed');

      }
      document.title=sensedate[witchActive] + ' ' + Sensors[Sensor[witchActive]] + ' ' + (!layerMSImode[witchActive] ? ProductsWMS[Product[witchActive]] : 'MSI');
      document.getElementById('notice').innerHTML="Maa-amet &nbsp; / &nbsp; ESTHub &nbsp; / &nbsp; Contains modified Copernicus Sentinel data " + sensedate[witchActive].substring(0,4);
      layerSAT[witchActive].getSource().updateParams({"date": sensedate[witchActive]});
      layerSAT[witchActive].getSource().clear();
      layerMSI[witchActive].getSource().updateParams({"date": sensedate[witchActive]});
      layerMSI[witchActive].getSource().clear();
      currentDate = newdate;
      break;
    }
  }
  onMoveEnd(false);
}


function changePictures() {
  document.getElementById('D-ProductList').style.visibility='hidden';
  if (!layerMSImode[(witchActive==0 ? 1 : 0)])  document.getElementById('D-LutWindow').style.visibility='hidden';

  if (sensedate[1]=='0000-00-00') {
    document.getElementById('comparediv').style.visibility='visible';
    if (currentLanguage === 'estonian'){
    document.getElementById('comparesensedate').innerHTML=sensedate[0] + ' &nbsp; ' + (!layerMSImode[0] ? ProductsTXT[Product[0]] : 'Kujundatud');
    }
    else{
    document.getElementById('comparesensedate').innerHTML=sensedate[0] + ' &nbsp; ' + (!layerMSImode[0] ? ProductsTXT[Product[0]] : 'Designed');

    }
    sensedate[1]=sensedate[0];
    Product[1]=Product[0];
    Sensor[1]=Sensor[0];
    layerSAT[1].getSource().updateParams({"date": sensedate[0]});
    layerSAT[1].getSource().setUrl('https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[0]].toLowerCase() + '-' + ProductsWMS[Product[0]].toLowerCase());
    layerSAT[1].getSource().updateParams({"LAYERS": Sensors[Sensor[0]].replace('-','_').toLowerCase() + '_' + ProductsWMS[Product[0]].toLowerCase()});

    layerMSI[1].getSource().updateParams({"date": sensedate[0]});

    if (layerMSImode[0]) {
      bands[1]=bands[0];
      layerMSI[1].getSource().updateParams({"bands" : bands[0][0] + ',' + bands[0][1] + ',' + bands[0][2]});

      gamma[1]=gamma[0];
      gammar[1]=gammar[0];
      gammag[1]=gammag[0];
      gammab[1]=gammab[0];

      setGamma(lutarr[1],gamma[1],gammar[1],gammag[1],gammab[1]);
      setLut(layerMSI[1],1,lutarr[1]);

      layerMSImode[1]=true;
    }

  } else {
    witchActive=(witchActive==1 ? 0 : 1);
    if (currentLanguage === 'estonian'){
    document.getElementById('comparesensedate').innerHTML=sensedate[(witchActive==1 ? 0 : 1)] + ' &nbsp; ' + (!layerMSImode[(witchActive==1 ? 0 : 1)] ? ProductsTXT[Product[(witchActive==1 ? 0 : 1)]] : 'Kujundatud');
    document.getElementById('sensedate').innerHTML=sensedate[witchActive] + ' &nbsp; ' + (!layerMSImode[witchActive] ? ProductsTXT[Product[witchActive]] : 'Kujundatud');
    document.getElementById('product').innerHTML=Sensors[Sensor[witchActive]] + ' &nbsp; ' + (!layerMSImode[witchActive] ? ProductsTXT[Product[witchActive]] : 'Kujundatud');
    }
    else{
    document.getElementById('comparesensedate').innerHTML=sensedate[(witchActive==1 ? 0 : 1)] + ' &nbsp; ' + (!layerMSImode[(witchActive==1 ? 0 : 1)] ? ProductsTXT[Product[(witchActive==1 ? 0 : 1)]] : 'Designed');
    document.getElementById('sensedate').innerHTML=sensedate[witchActive] + ' &nbsp; ' + (!layerMSImode[witchActive] ? ProductsTXT[Product[witchActive]] : 'Designed');
    document.getElementById('product').innerHTML=Sensors[Sensor[witchActive]] + ' &nbsp; ' + (!layerMSImode[witchActive] ? ProductsTXT[Product[witchActive]] : 'Designed');
    }

    layerSAT[0].setVisible(witchActive==0 && !layerMSImode[0]);
    layerMSI[0].setVisible(witchActive==0 && layerMSImode[0]);
    layerSAT[1].setVisible(witchActive==1 && !layerMSImode[1]);
    layerMSI[1].setVisible(witchActive==1 && layerMSImode[1]);

    document.getElementById('B1').value=bands[witchActive][0];
    document.getElementById('B2').value=bands[witchActive][1];
    document.getElementById('B3').value=bands[witchActive][2];

    document.getElementById('gamma').value=gamma[witchActive];
    document.getElementById('gammar').value=gammar[witchActive];
    document.getElementById('gammag').value=gammag[witchActive];
    document.getElementById('gammab').value=gammab[witchActive];

    document.getElementById('gammaTXT').innerHTML=Math.round(gamma[witchActive]*100);
    document.getElementById('gammarTXT').innerHTML=Math.round(gammar[witchActive]*100);
    document.getElementById('gammagTXT').innerHTML=Math.round(gammag[witchActive]*100);
    document.getElementById('gammabTXT').innerHTML=Math.round(gammab[witchActive]*100);

    document.getElementById('notice').innerHTML="Maa-amet &nbsp; / &nbsp; ESTHub &nbsp; / &nbsp; Contains modified Copernicus Sentinel data " + sensedate[witchActive].substring(0,4);
    document.title=sensedate[witchActive] + ' ' + Sensors[Sensor[witchActive]] + ' ' + (!layerMSImode[witchActive] ? ProductsWMS[Product[witchActive]] : 'MSI');
  }

  if (typeof(picker) !== 'undefined') picker.setDate(sensedate[witchActive]);

  onMoveEnd(false);
  createProductListDiv();

  window.dispatchEvent(new Event('resize'));

}


function bandschange() {
  bands[witchActive]=[document.getElementById('B1').value*1,document.getElementById('B2').value*1,document.getElementById('B3').value*1];
  layerMSI[witchActive].getSource().updateParams({"bands" : bands[witchActive][0] + ',' + bands[witchActive][1] + ',' + bands[witchActive][2]});

  onMoveEnd(false);
}


function lutChange() {
  gamma[witchActive]=document.getElementById('gamma').value;
  gammar[witchActive]=document.getElementById('gammar').value;
  gammag[witchActive]=document.getElementById('gammag').value;
  gammab[witchActive]=document.getElementById('gammab').value;

  setGamma(lutarr[witchActive],gamma[witchActive],gammar[witchActive],gammag[witchActive],gammab[witchActive]);

  setLut(layerMSI[witchActive],witchActive,lutarr[witchActive]);
}


function setGamma(arr,igamma,igammar,igammag,igammab) {
  v=[igammar*1+igamma*1,igammag*1+igamma*1,igammab*1+igamma*1];

  v[0]=Math.min(Math.max(v[0],-1),1);
  v[1]=Math.min(Math.max(v[1],-1),1);
  v[2]=Math.min(Math.max(v[2],-1),1);
  if (v<0) {
    for(j=0;j<3;j++) {
      vch=1-v[j]*-1;
      arr[j][1]=(Math.pow(31/255,1/vch) * 255);
      arr[j][2]=(Math.pow(63/255,1/vch) * 255);
      arr[j][3]=(Math.pow(95/255,1/vch) * 255);
      arr[j][4]=(Math.pow(127/255,1/vch) * 255);
      arr[j][5]=(Math.pow(159/255,1/vch) * 255);
      arr[j][6]=(Math.pow(191/255,1/vch) * 255);
      arr[j][7]=(Math.pow(223/255,1/vch) * 255);
    }
  } else {
    for(j=0;j<3;j++) {
      vch=1-v[j];
      arr[j][1]=255-(Math.pow((255-31)/255,1/vch) * 255);
      arr[j][2]=255-(Math.pow((255-63)/255,1/vch) * 255);
      arr[j][3]=255-(Math.pow((255-95)/255,1/vch) * 255);
      arr[j][4]=255-(Math.pow((255-127)/255,1/vch) * 255);
      arr[j][5]=255-(Math.pow((255-159)/255,1/vch) * 255);
      arr[j][6]=255-(Math.pow((255-191)/255,1/vch) * 255);
      arr[j][7]=255-(Math.pow((255-223)/255,1/vch) * 255);
    }
  }
}


function setLut(layer,lutStrNr,arr) {
  lut1='';
  lut2='';
  lut3='';
  for (i=0;i<9;i++) {
    lut1+=Math.max((i*32)-1,0) + ':' + Math.round(arr[0][i]) + ',';
    lut2+=Math.max((i*32)-1,0) + ':' + Math.round(arr[1][i]) + ',';
    lut3+=Math.max((i*32)-1,0) + ':' + Math.round(arr[2][i]) + ',';
  }
  lut1=lut1.substring(0,lut1.length-1);
  lut2=lut2.substring(0,lut2.length-1);
  lut3=lut3.substring(0,lut3.length-1);

  layer.getSource().updateParams({"lut1" : lut1});
  layer.getSource().updateParams({"lut2" : lut2});
  layer.getSource().updateParams({"lut3" : lut3});

  if (lutStrNr==0) {
    lutStr=[[lut1,lut2,lut3],lutStr[1]];
  } else if (lutStrNr==1) {
    lutStr=[lutStr[0],[lut1,lut2,lut3]];
  }

  onMoveEnd(false);
}


function minimap(minimapday,pn) {
  clearTimeout(MapOpener);
  document.getElementById('minimapimage').onload = null;
  document.getElementById('minimapimageloading').style.visibility = 'hidden';

  filterName=(!layerMSImode[witchActive] ? ProductsWMS[Product[witchActive]] : 'MSI');
  paramStr=(!layerMSImode[witchActive] ? '' : '&bands='+bands[witchActive][0]+','+bands[witchActive][1]+','+bands[witchActive][2]+'&lut1='+lutStr[witchActive][0]+'&lut2='+lutStr[witchActive][1]+'&lut3='+lutStr[witchActive][2]);

  if (minimapCache.includes(minimapday)) {
    document.getElementById('minimap').style.display = 'block';
    document.getElementById('minimapimage').src='https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[witchActive]].toLowerCase() + '-' + filterName.toLowerCase() + '?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/jpeg&LAYERS=' + Sensors[Sensor[witchActive]].replace('-','_').toLowerCase() + '_' + filterName.toLowerCase() + paramStr + '&date=' + minimapday + '&WIDTH=' + minimapimageWidth + '&HEIGHT=' + minimapimageHeight + '&SRS=EPSG:3301&STYLES=&BBOX=' + map.getView().calculateExtent(map.getSize())[0] + ',' + map.getView().calculateExtent(map.getSize())[1] + ',' + map.getView().calculateExtent(map.getSize())[2] + ',' + map.getView().calculateExtent(map.getSize())[3];
  } else {

    document.getElementById('minimapimageloading').style.visibility = 'visible';

    MapOpener = setTimeout(function(){

      mapaspect=((map.getView().calculateExtent(map.getSize())[3]-map.getView().calculateExtent(map.getSize())[1])/(map.getView().calculateExtent(map.getSize())[2]-map.getView().calculateExtent(map.getSize())[0]));

      minimapimageWidth=Math.round(pn.offsetWidth-20);
      minimapimageHeight=Math.round(minimapimageWidth*mapaspect);

      document.getElementById('minimap').style.bottom = Math.round(window.innerHeight-pn.offsetTop+15) + 'px';
      document.getElementById('minimap').style.right = window.innerWidth-(parseInt(pn.style.left)+pn.offsetWidth) + 'px';
      document.getElementById('minimap').style.width = Math.round(pn.offsetWidth) + 'px';
      document.getElementById('minimap').style.height = Math.round(pn.offsetWidth*mapaspect+7) + 'px';
      document.getElementById('minimap').style.display = 'block';

      document.getElementById('minimapimage').onload = function () {
        document.getElementById('minimapimageloading').style.visibility = 'hidden';
        minimapCache.push(minimapday);
        minimapCache = minimapCache.slice(-42);
      }
      document.getElementById('minimapimage').src='https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[witchActive]].toLowerCase() + '-' + filterName.toLowerCase() + '?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/jpeg&LAYERS=' + Sensors[Sensor[witchActive]].replace('-','_').toLowerCase() + '_' + filterName.toLowerCase() + paramStr + '&date=' + minimapday + '&WIDTH=' + minimapimageWidth + '&HEIGHT=' + minimapimageHeight + '&SRS=EPSG:3301&STYLES=&BBOX=' + map.getView().calculateExtent(map.getSize())[0] + ',' + map.getView().calculateExtent(map.getSize())[1] + ',' + map.getView().calculateExtent(map.getSize())[2] + ',' + map.getView().calculateExtent(map.getSize())[3];

    }, 250);
  }
}


function createProductListDiv() {
  document.getElementById('D-ProductList').innerHTML = '';

  for(i=0;i<ProductsWMS.length+1;i++) {
    if (i<ProductsWMS.length) {
      if (!layerMSImode[witchActive] && i==Product[witchActive]) {
        filterButton = 'buttonnoy';
      } else {
        filterButton = 'buttonno';
      }
      if (currentLanguage === 'estonian'){
      filterInfo = ProductsInfo[i];
      }
      else{
      filterInfo = ProductsInfoEng[i];
      }
      filterTXT = ProductsTXT[i];
      onClickStr='filterClick(' + i + ')';
    } else if (i==ProductsWMS.length) {
      filterButton = (layerMSImode[witchActive] ? 'buttonnoy' : 'buttonno');
      if (currentLanguage === 'estonian'){
      filterInfo = 'Kujundatud';
      filterTXT = 'Kujundatud';
      }
      else{
      filterInfo = 'Designed';
      filterTXT = 'Designed';
      }
      onClickStr='MSIswitch(); switchLanguage(currentLanguage);';
    }
    document.getElementById('D-ProductList').innerHTML += '<div title="Filter:  ' + filterInfo + '" onclick="' + onClickStr + '" class="' + filterButton + '" style="z-index: 99999900; cursor:pointer; height:2.2em; width:6.9em; margin-top:0.5em;"><table width="100%" height="100%" border="0"><tr><td nowrap valign="center" align="center"><span>' + filterTXT + '</span></td></tr></table></div>';
  }
}


function MSIswitch() {
  if (!layerMSImode[witchActive]) {
    MSIclick();
  } else {
    filterClick(0);
  }
}


function filterClick(i) {
  document.getElementById('D-LutWindow').style.visibility='hidden';
  changeProduct(i);

  document.getElementById('product').innerHTML=Sensors[Sensor[witchActive]] + ' &nbsp; ' + ProductsTXT[Product[witchActive]];
  document.getElementById('sensedate').innerHTML=sensedate[witchActive] + ' &nbsp; ' + ProductsTXT[Product[witchActive]];
  document.title=sensedate[witchActive] + ' ' + Sensors[Sensor[witchActive]] + ' ' + ProductsWMS[Product[witchActive]];

  if (layerMSImode[witchActive]) {
    document.getElementById('LutDiv').className="buttonno";
    layerMSImode[witchActive] = false;
  }
  createProductListDiv();
  onMoveEnd(false);
}


function MSIclick() {
  if (!layerMSImode[witchActive]) {
    document.getElementById('B1').value=bands[witchActive][0];
    document.getElementById('B2').value=bands[witchActive][1];
    document.getElementById('B3').value=bands[witchActive][2];

    document.getElementById('gamma').value=gamma[witchActive];
    document.getElementById('gammar').value=gammar[witchActive];
    document.getElementById('gammag').value=gammag[witchActive];
    document.getElementById('gammab').value=gammab[witchActive];

    document.getElementById('product').innerHTML=Sensors[Sensor[witchActive]] + ' &nbsp; Kujundatud';
    document.getElementById('sensedate').innerHTML=sensedate[witchActive] + ' &nbsp; Kujundatud';
    document.title=sensedate[witchActive] + ' ' + Sensors[Sensor[witchActive]] + ' MSI';

    document.getElementById('LutDiv').className="buttonnoy";
    layerMSImode[witchActive] = true;
    createProductListDiv();
    onMoveEnd(false);
  }
}


function changeProduct(np) {
  setOrto(-1);

  if (!layerMSImode[witchActive] && Product[witchActive] == np) {
    Product[witchActive]=0;
  } else {
    Product[witchActive]=np;
  }
  createProductListDiv();

  layerSAT[witchActive].getSource().setUrl('https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[witchActive]].toLowerCase() + '-' + ProductsWMS[Product[witchActive]].toLowerCase());
  layerSAT[witchActive].getSource().updateParams({"LAYERS": Sensors[Sensor[witchActive]].replace('-','_').toLowerCase() + '_' + ProductsWMS[Product[witchActive]].toLowerCase()});
  console.log('https://teenus.maaamet.ee/ows/wms-' + Sensors[Sensor[witchActive]].toLowerCase() + '-' + ProductsWMS[Product[witchActive]].toLowerCase());
  console.log({"LAYERS": Sensors[Sensor[witchActive]].replace('-','_').toLowerCase() + '_' + ProductsWMS[Product[witchActive]].toLowerCase()});
  layerSAT[witchActive].getSource().clear();

  onMoveEnd(false);
}


function changeLutClick() {
  if (document.getElementById('D-LutWindow').style.visibility=='visible') {
    MSIclick();
  }
}


function initDate() {
  var oReq = new XMLHttpRequest();
  oReq.onload = function(e) {
    SatList = JSON.parse(oReq.responseText);
    if (typeof(SatList[0]['date'])==='string') {
      setsensdateexact(SatList[0]['date']);
      layerSAT[0].setVisible(true);
      document.getElementById('notice').innerHTML="Maa-amet &nbsp; / &nbsp; ESTHub &nbsp; / &nbsp; Contains modified Copernicus Sentinel data " + sensedate[0].substring(0,4);
      document.title=sensedate[0] + ' ' + Sensors[Sensor[0]] + ' ' + ProductsWMS[Product[0]];
    }
  }
  oReq.open("GET", "https://geoportaal.maaamet.ee/index.php?page_id=733&formaat=json");
  oReq.send();
}


function setHybrid() {
  if(Hybrid) {
    Hybrid_tile.setVisible(false);
    document.getElementById('HybridDiv').className="buttonno";
    Hybrid=false;
  } else {
    Hybrid_tile.setVisible(true);
    document.getElementById('HybridDiv').className="buttonnoy";
    Hybrid=true;
  }
  Hybrid=Hybrid_tile.getVisible();
  onMoveEnd(false);
}


function loadEtcVector(nr) {
  if (nr==0) {
    featureRequest = new ol.format.WFS().writeGetFeature({
      srsName: 'EPSG:3301',
      featureTypes: ['pria_ehitised'],
      outputFormat: 'application/json',
      geometryName: 'geometry',
      bbox: map.getView().calculateExtent(map.getSize()),
      filter: ol.format.filter.equalTo('loomaliigid', 'MESILANE'),
    });
    fetch('https://kls.pria.ee/geoserver/pria_avalik/ows', {
      method: 'POST',
      body: new XMLSerializer().serializeToString(featureRequest),
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      features = new ol.format.GeoJSON().readFeatures(json);
      layerEtc.getSource().addFeatures(features);
    });
  }
}


let number = -1;
function setCms(nr) {
  number = nr;
  if (nr==-1 || nr==Cms) {
    CmsLayerGroup.setVisible(false);
    document.getElementById('slider-distance').style.visibility='hidden';
    Cms=-1;
  } else {
    CmsLayerGroup.setVisible(true);
    Cms = -1;
    document.getElementById('slidetInputValMin').value = (CmsRange[nr][0]+50);
    document.getElementById('slidetInputValMin').dispatchEvent(new Event('input'));
    document.getElementById('slidetInputValMax').value = (CmsRange[nr][1]+50);
    document.getElementById('slidetInputValMax').dispatchEvent(new Event('input'));
//    document.getElementById('slidetInputValMin').value = CmsRange[nr][0];
//    document.getElementById('slidetInputValMax').value = CmsRange[nr][1];
    Cms=nr;
    if (CmsLayer[nr] === undefined) loadCms(nr);
    document.getElementById('slider-distance').style.visibility='visible';
  }

  for(i=0;i<CmsLayers.length;i++) {
    if (i==Cms) {
      document.getElementById('cms-' + i).className="buttonnoy";
      if (CmsLayer[i] !== undefined) CmsLayer[i].setVisible(true);
    } else {
      document.getElementById('cms-' + i).className="buttonno";
      if (CmsLayer[i] !== undefined) CmsLayer[i].setVisible(false);
    }
  }
  onMoveEnd(false);
}

var CmsWMTS=['https://wmts.marine.copernicus.eu/teroWmts/GLOBAL_ANALYSISFORECAST_PHY_001_024?SERVICE=WMTS&version=1.0.0&REQUEST=GetCapabilities','https://wmts.marine.copernicus.eu/teroWmts/GLOBAL_ANALYSISFORECAST_PHY_001_024?SERVICE=WMTS&version=1.0.0&REQUEST=GetCapabilities'];
var CmsStyle=['cmap:rainbow','cmap:rainbow'];
var CmsRange=[[-5,5],[-10,10]];
var CmsLayers=['GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy_anfc_0.083deg_P1D-m_202211/tob','GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy_anfc_0.083deg_P1D-m_202211/tob'];
var CmsMatrixSet=['EPSG:3857@2x','EPSG:3857@2x'];
var Cms=-1;
var CmsLayer=[undefined,undefined];
var CmsParser=[new ol.format.WMTSCapabilities(),new ol.format.WMTSCapabilities()];
var CmsOptions=[undefined,undefined];

function loadCms(nr) {

fetch(CmsWMTS[nr])
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    var result = CmsParser[nr].read(text);
    var options = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: CmsLayers[nr],
      matrixSet: CmsMatrixSet[nr],
    });
    options.dimensions.time = currentDate;
    CmsOptions[nr] = options;
    CmsOptions[nr]['style'] = 'range:' + CmsRange[nr][0] + '/' + CmsRange[nr][1] + ',' + CmsStyle[nr];
    console.log(CmsOptions[nr]);
    CmsLayer[nr] = new ol.layer.Tile({
      visible : true,
      source: new ol.source.WMTS(CmsOptions[nr]),
      wrapX: true,
      projection: 'EPSG:3857',

    });

    CmsLayerGroup.getLayers().push(CmsLayer[nr]);
  });
}
let number2 = -1;
function setClms(nr) {
  number2 = nr;
  if (nr==-1 || nr==Clms) {
    ClmsLayerGroup.setVisible(false);
    CLms=-1;
    document.getElementById('clms-0').className="buttonno";
  } else {
    ClmsLayerGroup.setVisible(true);
    Clms = -1;

    document.getElementById('clms-0').className="buttonnoy";
    if (ClmsLayer[nr] === undefined) loadClms(nr);}


  onMoveEnd(false);
}
var ClmsWMS = ['https://geoserver2.ymparisto.fi/geoserver/eo/ows?service=wms&version=1.3.0&request=GetCapabilities'];
var ClmsMatrixSet = ['EPSG:3067'];
var ClmsParser = [new ol.format.WMSCapabilities()];
var ClmsOptions = [undefined, undefined];
var ClmsLayer = [undefined, undefined];
var Clms=-1;
function loadClms(nr) {
  fetch(ClmsWMS[nr])
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      var result = ClmsParser[nr].read(text);
      var layer = result.Capability.Layer.Layer[15];
      console.log(layer);
      layer.Dimension[0].default = '2024-04-30T00:00:00.000Z';

      // Construct the options for the WMS source
      var options = {
        url: ClmsWMS[nr],
        params: {
          'LAYERS': layer.Name,
          'TILED': true,
          'FORMAT': 'image/png',
        },
        serverType: 'geoserver',
      };
      console.log(options);

      // Create the WMS layer using the options
      var source = new ol.source.TileWMS(options);

      // Create the layer
      var layer = new ol.layer.Tile({
        visible: true,
        source: source,
        wrapX: true,
        projection: 'EPSG:3857',
      });
      console.log(layer);

      // Add the layer to the layer group
      ClmsLayerGroup.getLayers().push(layer);
    })
    .catch(function (error) {
      console.error('Error fetching or parsing capabilities:', error);
    });
}


function setEtc(nr) {
  if (nr==-1) {
    layerEtc.setVisible(false);
    document.getElementById('etc-0').className="buttonno";
    Etc=-1;
  } else {
    loadEtcVector(nr);
    if (nr==0) document.getElementById('etc-0').className="buttonnoy";
    Etc=nr;
    layerEtc.setVisible(true);
  }

  if (Etc==0 || deadtrees==1) {
    document.getElementById('EtcDiv').className="buttonnoy";
  } else {
    document.getElementById('EtcDiv').className="buttonno";
  }

  onMoveEnd(false);
}


function setDeadtrees(nr) {
  if (nr==1) {
    layerDeadtrees.setVisible(true);
    document.getElementById('deadtrees').className="buttonnoy";
  } else {
    layerDeadtrees.setVisible(false);
    document.getElementById('deadtrees').className="buttonno";
  }
  deadtrees=nr;

  if (Etc==0 || deadtrees==1) {
    document.getElementById('EtcDiv').className="buttonnoy";
  } else {
    document.getElementById('EtcDiv').className="buttonno";
  }

  onMoveEnd(false);
}


function setOrto(nr) {
  if (nr==-1 || nr==Orto) {
    layerOrto.setVisible(false);
    document.getElementById('OrtoDiv').className="buttonno";
    Orto=-1;
  } else {
    document.getElementById('OrtoDiv').className="buttonnoy";
    Orto=nr;
    layerOrto.getSource().setUrl(OrtoUrl[''+Orto+'']);
    layerOrto.getSource().updateParams({"LAYERS": OrtoWMS[''+Orto+'']});
    layerOrto.getSource().clear();
    layerOrto.setVisible(true);
  }

  for(i=0;i<OrtoWMS.length;i++) {
    if (i==Orto) {
      document.getElementById('orto-' + i).className="buttonnoy";
    } else {
      document.getElementById('orto-' + i).className="buttonno";
    }
  }

  onMoveEnd(false);
}


function setMask(nr) {
  if (Mask==nr) {
    layerMask.setVisible(false);
    document.getElementById('MaskDiv').className="buttonno";
    Mask=-1;
  } else {
    document.getElementById('MaskDiv').className="buttonnoy";
    Mask=nr;
    layerMask.getSource().updateParams({"LAYERS": MaskWMS[''+Mask+'']});
    layerMask.getSource().clear();
    layerMask.setVisible(true);
  }

  for(i=0;i<MaskWMS.length;i++) {
    if (i==Mask) {
      document.getElementById('mask-' + i).className="buttonnoy";
    } else {
      document.getElementById('mask-' + i).className="buttonno";
    }
  }

  onMoveEnd(false);
}


function setBorders(nr) {
  if (Borders==nr) {
    layerBorders.setVisible(false);
    document.getElementById('BordersDiv').className="buttonno";
    Borders=-1;
  } else {
    document.getElementById('BordersDiv').className="buttonnoy";
    Borders=nr;
    layerBorders.getSource().updateParams({"LAYERS": BordersWMS[''+Borders+'']});
    layerBorders.getSource().clear();
    layerBorders.setVisible(true);
  }

  for(i=0;i<BordersWMS.length;i++) {
    if (i==Borders) {
      document.getElementById('borders-' + i).className="buttonnoy";
    } else {
      document.getElementById('borders-' + i).className="buttonno";
    }
  }

  onMoveEnd(false);
}


function init() {
//  HelpMeText();
  if (sensedate[0]=='0000-00-00') initDate();
  wResize();
  document.getElementById('mapRotationImage').style.transform='rotate(' + rot + 'rad)';
  loadEtcVector(Etc);
}


function wResize() {
  MapHistoryPush=false;
  if (typeof(picker) !== 'undefined') picker.hide();
  minimapCache=[];

  if (map.getSize()[0]<620 && document.getElementById('comparediv').style.visibility=='visible') {
    if (document.getElementById('scalebar').style.visibility=='visible') document.getElementById('scalebar').style.visibility='hidden';
  } else if (document.getElementById('scalebar').style.visibility=='hidden') {
    document.getElementById('scalebar').style.visibility='visible';
  }

  if (map.getSize()[0] / parseFloat(getComputedStyle(document.querySelector('body'))['font-size']) < 48) {
    if (document.getElementById('InAadressDiv').style.top == '1em') {
      document.getElementById('InAadressDiv').style.top = '4em';
      document.getElementById('InAadressDiv').style.left = null;
      document.getElementById('InAadressDiv').style.right = '1em';
    }
  } else {
    if (document.getElementById('InAadressDiv').style.top == '4em') {
      document.getElementById('InAadressDiv').style.top = '1em';
      document.getElementById('InAadressDiv').style.right = null;
      document.getElementById('InAadressDiv').style.left = '7em';
    }

  }

}


function NavigateTo(dir) {
  if (MapHistoryNr==0 && dir<0) return;
  if (MapHistory.length-1==MapHistoryNr && dir>0) return;
  MapHistoryPush=false;
  MapHistoryNr = MapHistoryNr + dir;
  document.getElementById('NavPrev').className=(MapHistoryNr==0 ? 'buttonnog' : 'buttonno');
  document.getElementById('NavNext').className=(MapHistory.length-1==MapHistoryNr ? 'buttonnog' : 'buttonno');
  map.getView().animate({rotation: MapHistory[MapHistoryNr][2], center: MapHistory[MapHistoryNr][0], resolution: MapHistory[MapHistoryNr][1], duration: 250});
}

var HelpElements=[
['ZoomIn','Suurendab kaarti 2x sisse',0,0, 'Zooms in the map 2x'],
['ZoomOut','Suurendab kaarti 2x välja',0,0, 'Zooms out the map 2x'],
['mapRotationDiv','Kaardi pööramine põhja-lõunasuunaliseks<br>Kaardi pööramine: hoia all klahve Alt+Shift ning lohista hiirega kaardil',0,0, 'Rotates the map north-south<br>Rotate the map: hold down Alt+Shift keys and drag the mouse on the map'],
['NavPrev','Kaardi navigeerimine eelmisele vaatele',0,0, 'Navigates to the previous view on the map'],
['NavNext','Kaardi navigeerimine järgmisele vaatele',0,0, 'Navigates to the next view on the map'],
['NavToOne','Kaardi suurendamine 1px=10m',0,0, 'Zooms the map 1px=10m'],
['PositionButtonDiv','Näita oma asukohta kaardil',0,0, 'Shows your location on the map'],
['SaveScreen','Salvesta kaardipilt',0,0, 'Saves the map image'],
['export-png','Salvesta kaardipilt png formaadis',1,0, 'Saves the map image in PNG format'],
['export-pgw','Salvesta kaardipilt png formaadis koos asukohafailiga<br>Võimaldab pilti kasutada GIS programmides georefereeritult',1,0, 'Saves the map image in PNG format with a location file<br>Allows the image to be used in GIS programs georeferenced'],
['export-png-clipboard','Kopeeri kaardipilt vahemällu',1,0, 'Copies the map image to the clipboard'],
['CopyLink','Kopeeri WMS või lehekülje aadress vahemällu',0,0, 'Copies the WMS or page link to the clipboard'],
['export-wms-clipboard','Kopeeri WMS aadress vahemällu',1,0, 'Copies the WMS address to the clipboard'],
['export-url-clipboard','Kopeeri lehekülje aadress vahemällu',1,0, 'Copies the page address to the clipboard'],
//['InAadressDiv','Otsi asukohta kaardil',0,1],
['Help','Abiaken',0,1, 'Help window'],
['OrtoDiv','Ortofoto ja taimkatte kaardikihid',0,0, 'Orthophoto and vegetation map layers'],
['BordersDiv','Piiride kaardikihtide valik<br>Lisa vaadeldava pildi peale soovitud vektorkiht',0,0, 'Selection of boundary map layers<br>Add the desired vector layer on top of the observed image'],
['MaskDiv','Maski kaardikihtide valik<br>Täpsusta huvipakkuv nähtus ja peida maski abil muud nähtuse tüübid',0,0, 'Selection of mask map layers<br>Specify the phenomenon of interest and hide other types of phenomena with the mask'],
['EtcDiv','Muud kaardikihid',0,0, 'Other map layers'],
['HybridDiv','Hübriidkaardi sisse-välja lülitamine',0,0, 'Toggle hybrid map on-off'],
['Resample','Satelliitpildi pehmenduse (bilinear) sisse-välja lülitamine pikslite väljatoomiseks',0,1, 'Toggle satellite image resampling (bilinear) on-off to bring out pixels'],
['LutDiv','Satelliitpildi kujundamine',0,0, 'Satellite image design'],
['ChooseFilter','Vali satelliitpildi filter',0,0, 'Choose satellite image filter'],
['kuupaevdiv','Valitud satelliitpilt ja selle filter<br>Vali satelliitpildi kuupäev',0,1, 'Selected satellite image and its filter<br>Select the satellite image date'],
['setcomparediv','Satelliitpildi võrdlus',0,0, 'Compare satellite images'],
['comparediv','Võrreldava satelliitpildi nimi ja filter',0,0, 'Name and filter of the comparable satellite image'],
['koordinaadid','Kursori koordinaadid',0,1, 'Cursor coordinates'],
['NDVI','NDVI väärtus kursori asukohas',0,0, 'NDVI value at cursor location']
];
//'NavToOne',


function HelpMeText() {
//  <div id="D-HelpWindow" style="visibility:visible; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); box-shadow: 0em 0em 2em rgba(0,0,0,1); background: rgba(255,2559,255,0.9);"><table width="100%" height="100%" border="1"><tr><td id="HelpText" style="color:black; padding:2em" align="center" valign="center">&nbsp;</td></tr></table></div>
  if (currentLanguage === 'estonian'){
  document.getElementById('HelpText').innerHTML='<h1 style="color: black;">Kontakt: <a href="mailto:esthub@maaamet.ee">esthub@maaamet.ee</a></h1><br><hr style="width: 50%"><br>';
  }
  else{
    document.getElementById('HelpText').innerHTML='<h1 style="color: black;">Contact: <a href="mailto:esthub@maaamet.ee">esthub@maaamet.ee</a></h1><br><hr style="width: 50%"><br>';
  }

  var _Hdiv = document.getElementById('HelpText');

  var _Htbl = document.createElement("table");
  var _HtblBody = document.createElement("tbody");

  for (oneelement of HelpElements) {

    var _Hrow = document.createElement("tr");
    var _Hrow3 = document.createElement("tr");
    var _Hcell1 = document.createElement("td");
    var _Hcell2 = document.createElement("td");
    var _Hcell3 = document.createElement("td");

    if (oneelement[3]==1) {
      _Hcell3.style.padding="0.5em";
      _Hcell3.align = "center";
      _Hcell3.colSpan = "2";
      _hr = document.createElement("hr");
      _hr.style.width ="50%";
      _Hcell3.appendChild(_hr);
      _Hrow3.appendChild(_Hcell3);
      _HtblBody.appendChild(_Hrow3);
    }

    tmp=document.getElementById(oneelement[0]).cloneNode(true);

    if (oneelement[0]=='InAadressDiv') {
      tmp.firstChild.removeChild(tmp.firstChild.lastChild);
      tmp.style.height = "32px";
      tmp.firstChild.style.height = "32px";
    }

    tmp.id="";
    tmp.removeAttribute("onclick");
    tmp.removeAttribute("id");
    tmp.style.position = "";
    tmp.style.visibility = "";
    tmp.style.top = "";
    tmp.style.bottom = "";
    tmp.style.left = "";
    tmp.style.right = "";
    tmp.style.color = "white";
    tmp.style.margin = "";
//    document.getElementById('HelpText').appendChild(tmp);
//    document.getElementById('HelpText').appendChild(document.createTextNode(oneelement[1]));
    _Hcell1.appendChild(document.createElement("span").appendChild(tmp));
    _Hcell1.style.paddingLeft = "0.5em";
    _Hcell1.style.paddingRight = (oneelement[2]==1 ? "0.5em" : "2em");
    _Hcell1.style.paddingTop = "0.5em";
    _Hcell1.style.paddingBottom = "0.5em";
    _Hcell1.align = "right";
//    _Hcell2.appendChild(document.createTextNode(oneelement[1]));
    if (currentLanguage === 'estonian'){_Hcell2.innerHTML = oneelement[1];}
    else if (currentLanguage === 'english') {_Hcell2.innerHTML = oneelement[4];}

    _Hcell2.style.paddingLeft = (oneelement[2]==1 ? "2em" : "0.5em");
    _Hcell2.style.paddingRight = "0.5em";
    _Hcell2.style.paddingTop = "0.5em";
    _Hcell2.style.paddingBottom = "0.5em";
    _Hrow.appendChild(_Hcell1);
    _Hrow.appendChild(_Hcell2);
    _HtblBody.appendChild(_Hrow);
 }

  _Htbl.appendChild(_HtblBody);
  document.getElementById('HelpText').appendChild(_Htbl);
}

window.addEventListener('resize', function(event){
  wResize();
});

function geo_lest(ne) {
  LAT = (ne[1]*(Math.PI/180));
  LON = (ne[0]*(Math.PI/180));
  a = 6378137.000000000000;
  F = 298.257222100883;
  RF = F;
  F = (1/F);
  B0 = ((57.000000000000 + 31.000000000000 / 60.000000000000 + 3.194148000000 / 3600.000000000000)*(Math.PI/180));
  L0 = ((24.000000000000)*(Math.PI/180));
  FN = 6375000.000000000000;
  FE = 500000.000000000000;
  B1 = ((59.000000000000 + 20.000000000000 / 60.000000000000)*(Math.PI/180));
  B2 = ((58.000000000000) * (Math.PI/180));
  f1 = (1/RF);
  er = ((2.000000000000 * f1) - (f1 * f1));
  e = Math.sqrt(er);
  t1 = Math.sqrt(((1.000000000000 - Math.sin(B1)) / (1.000000000000 + Math.sin(B1))) * (Math.pow(((1.000000000000 + e * Math.sin(B1)) / (1.000000000000 - e * Math.sin(B1))), e)));
  t2 = Math.sqrt(((1.000000000000 - Math.sin(B2)) / (1.000000000000 + Math.sin(B2))) * (Math.pow(((1.000000000000 + e * Math.sin(B2)) / (1.000000000000 - e * Math.sin(B2))), e)));
  t0 = Math.sqrt(((1.000000000000 - Math.sin(B0)) / (1.000000000000 + Math.sin(B0))) * (Math.pow(((1.000000000000 + e * Math.sin(B0)) / (1.000000000000 - e * Math.sin(B0))), e)));
  t = Math.sqrt(((1.000000000000 - Math.sin(LAT)) / (1.000000000000 + Math.sin(LAT))) * (Math.pow(((1.000000000000 + e * Math.sin(LAT)) / (1.000000000000 - e * Math.sin(LAT))), e)));
  m1 = (Math.cos(B1) / (Math.pow((1.000000000000 - er * Math.sin(B1) * Math.sin(B1)), 0.500000000000)));
  m2 = (Math.cos(B2) / (Math.pow((1.000000000000 - er * Math.sin(B2) * Math.sin(B2)), 0.500000000000)));
  n = ((Math.log(m1) - Math.log(m2)) / (Math.log(t1) - Math.log(t2)));
  FF = (m1 / (n * Math.pow(t1, n)));
  p0 = (a * FF * (Math.pow(t0, n)));
  FII = (n * (LON - L0));
  p = (a * FF * Math.pow(t, n));
  n = (p0 - (p * Math.cos(FII)) + FN);
  e = (p * Math.sin(FII) + FE);

  return [e,n];
}




map.on('pointermove', function(evt) {
  if (evt.dragging) {
    return;
  }
  clearTimeout(MouseMove_timer);
  document.getElementById('myHeight').innerHTML="&nbsp;";

  MouseMove_timer=setTimeout(function(){
    var hReq = new XMLHttpRequest();
    hReq.onload = function(e) {
      demValue = hReq.responseText;
      if (hReq.responseText.length<10) {
        document.getElementById('myHeight').innerHTML=(demValue/10000);
      }
    }
    hReq.open("GET", "https://teenus.maaamet.ee/ows/wms-sentinel-2-ndvi?mode=query&mapxy=" + evt.coordinate[0] + "%20" + evt.coordinate[1] + "&qlayer=sentinel_2_ndvi_two&date=" + sensedate[witchActive]);
    hReq.send();
  }, 500);
 document.getElementById('myPosition').innerHTML=Math.round(evt.coordinate[0]) + ' ' + Math.round(evt.coordinate[1]);
});


var geolocation = new ol.Geolocation({
  tracking: false,
  trackingOptions: {
    enableHighAccuracy: true
  },
  projection: new ol.proj.Projection({code: 'EPSG:3301'})
});


geolocation.on('change:position', function() {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new ol.geom.Point(geo_lest(coordinates)) : null);
});

geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});



function refreshDivContent(translationValue) {
    // Select the input element directly
    const inputElement = document.querySelector('.inads-input-div .inads-input');

    // Check if the input element exists
    if (inputElement) {
        // Update the placeholder attribute
        inputElement.setAttribute('placeholder', translationValue);
    } else {
        // Log an error or handle the case where the element is not found
        console.error('Input element not found');
    }
}


//['katastriuksused','kaitsealad','kaitsemetsad','metsateatised','pollumassiivid'];
borders_legend_urls = ['', '','','','https://teenus.maaamet.ee/ows/wms-satiladu?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=kaitsemetsad&format=image/png&STYLE=default', '', '', '', '', '']
borders_alternate_legends = ["<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='None'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">", "<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='None'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">","<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='None'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">", "<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='red'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='red' stroke-width='2' fill='rgba(255, 0, 0, 0.5)'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">", '', "<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='None'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">","<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='None'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">", "<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='None'/></svg>\" alt=\"Legend Image\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">", '', '']
borders_legend_titles = ['- katastripiir','- riigimetsa piir','- erametsa piir','- kaitsealade piir','- kaitsemetsa piir','- metsateatiste piir', '- põldude piir', '- kõrgusjoon', '', '']
borders_titles = ['Kataster', 'Riigimets', 'Eramets', 'Kaitsealad', 'Kaitsemets', 'Teatised', 'Põld', 'Kõrgused', 'Põhikaart', 'Mullastik']
borders_help_text = ['<strong style=font-size:20px;>Katastrikaart</strong><br><br>Kaardikiht annab kõige ajakohasema seisu maakatastris registreeritud katastriüksuste üldandmete kohta. Katastripiirid kaardirakenduses on informatiivsed<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Riigimetsa kaart</strong><br><br>Musta joonega piiratud alad on riigi omandis. <br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Erametsa kaart</strong><br><br> Erametsa kaardil paiknevad musta joonega piiratud alad on eraomandis olevad metsad.  <br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Kaitsealad</strong><br><br>Eestis on kokku 859 kaitseala kogupindalaga 831 273 ha. Punase joonega piiritletud alad on Eestis määratletud kaitsealad<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://kaitsealad.ee/et<br>', '<strong style=font-size:20px;>Kaitsemets</strong><br><br>Kaitsemetsa asukoht võib olla kaitsealal, kaitstava looduse üksikobjekti ümber ja ranna piiranguvööndis ning hoiualal. Kaitsemetsade näiteks saab tuua puhkealad, metsapargid ja parkmetsad, linnade rohelise vööndi metsad ja rohealade puistud, maanteede ja raudteede äärsed metsad, kõrge saagikusega marja- ja seenemetsad, mereäärsed rannametsad, mälestiste kaitsevööndite metsad ning allikalised alad.<br>Antud kaardikihil on kaitsemets helesinise joonega piiritletud aladel<br><br><strong style=font-size:20px;>Allikas:</strong><br>https://kah-alad.ee/moisted/kaitsemets/<br>', '<strong style=font-size:20px;>Teatiste kaart</strong><br><br>Kaardil on musta joonega piiritletud alad teatised.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Põldude kaart</strong><br><br> Kaardil on musta joonega piiritletud alad põllud.<<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Samakõrgusjoonte kaart</strong><br><br>Joon, mis ühendab samal kõrgusel üle merepinna asuvad punktid joonena. Reeglina kasutatakse kaardil ühesuguse kõrguserinevusega samakõrgusjooni, nt 2 või 5 meetrise vahega. Tulemusena näitab joonte omavaheline horisontaalne kaugus nõlva kallet.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://wiki.estgis.ee/index.php?title=Samak%C3%B5rgusjoon<br>', '<strong style=font-size:20px;>Eesti põhikaart</strong><br><br>Eesti põhikaart 1:10 000 on digitaalne suuremõõtkavaline topograafiline kaart, mida toodetakse Eesti topograafia andmekogu (ETAK) andmetest.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Mullastik</strong><br><br><strong>Tz</strong> Maetud muld<br> <strong>Kh</strong> Paepealne muld<br> <strong>Tzg</strong> Gleistunud maetud muld<br> <strong>Kr</strong> Koreserikas rähkmuld<br> <strong>Gor</strong> Koreserikas leostunud gleimuld<br> <strong>K</strong> Rähkmuld<br> <strong>Go</strong> Leostunud gleimuld<br> <strong>Kk</strong> Klibumuld<br> <strong>GI</strong> Leetjas gleimuld<br> <strong>Kor</strong> Koreserikas leostunud muld<br> <strong>LPG</strong> Kahkjas leetunud gleimuld<br> <strong>Ko</strong> Leostunud muld<br> <strong>LkG</strong> Leetunud gleimuld<br> <strong>KI</strong> Leetjas muld<br> <strong>LG</strong> Leede-gleimuld<br> <strong>Gh1</strong> Paepealne turvastunud muld<br> <strong>Go1</strong> Küllastunud turvastunud muld<br> <strong>GI1</strong> Küllastumata turvastunud muld<br> <strong>LG1</strong> Leede-turvastunud muld<br> <strong>M</strong> Madalsoomuld<br> <strong>S</strong> Siirdesoomuld<br> <strong>R</strong> Rabamuld<br> <strong>E2k</strong> Keskmiselt erodeeritud rähkmuld<br> <strong>E2o</strong> Keskmiselt erodeeritud leostunud ja leetjas muld<br> <strong>E2I</strong> Keskmiselt erodeeritud kahkjas leetunud ja leetunud muld<br> <strong>E3k</strong> Tugevasti erodeeritud rähkmuld<br> <strong>E3o</strong> Tugevasti erodeeritud leostunud ja leetjas muld<br> <strong>E3I</strong> Tugevasti erodeeritud kahkjas leetunud ja leetunud muld<br> <strong>D</strong> Deluviaalmuld<br> <strong>Dg</strong> Gleistunud deluviaalmuld<br> <strong>DG</strong> Deluviaal-gleimuld<br> <strong>Ag</strong> Gleistunud lammimuld<br> <strong>AG</strong> Lammi-gleimuld<br> <strong>AG1</strong> Lammi-turvastunud muld<br> <strong>AM</strong> Lammi-madalsoomuld<br> <strong>Ar</strong> Sooldunud primitiivne muld<br> <strong>ArG</strong> Sooldunud gleimuld<br> <strong>ArG1</strong> Sooldunud turvastunud muld<br> <strong>Arv</strong> Sooldunud veealune muld<br> <strong>Gr</strong> Ranniku - gleimuld<br> <strong>Gr1</strong> Ranniku - turvastunud muld<br> <strong>Mr</strong> Ranniku - madalsoomuld<br> <strong>Av</strong> Veealune muld<br> <strong>TzG</strong> Maetud gleimuld<br> <strong>TzM</strong> Maetud madalsoomuld<br> <strong>Tu</strong> Puistangumuld<br> <strong>Tug</strong> Gleistunud puistangumuld<br> <strong>TuG</strong> Puistangu gleimuld<br> <strong>TuM</strong> Puistangu madalsoomuld<br> <strong>Pu</strong> Puistangupinnas<br> <strong>Pug</strong> Gleistunud puistangupinnas<br> <strong>PuG</strong> Glei-puistangupinnas<br> <strong>Pp</strong> Paljandpinnas<br> <strong>Ppg</strong> Gleistunud paljandpinnas<br> <strong>PpG</strong> Glei-paljandpinnas<br> <strong>C</strong> Tehispinnas<br> <strong>Ty</strong> Segatud muld<br> <strong>Tyg</strong> Gleistunud segatud muld<br> <strong>TyG</strong> Segatud gleimuld<br> <strong>TyM</strong> Segatud madalsoomuld<br> <strong>L</strong> Primitiivne leedemuld (liivmuld)<br> <strong>LI</strong> Nõrgalt leetunud leedemuld<br> <strong>LII</strong> Keskmiselt leetunud leedemuld<br> <strong>LIII</strong> Tugevasti leetunud leedemuld<br> <strong>Ls</strong> Sekundaarne leedemuld<br> <strong>Khg</strong> Gleistunud paepealne muld<br> <strong>Krg</strong> Gleistunud koreserikas rähkmuld<br> <strong>Kg</strong> Gleistunud rähkmuld<br> <strong>Kkg</strong> Gleistunud klibumuld<br> <strong>Korg</strong> Gleistunud koreserikas leostunud muld<br> <strong>Kog</strong> Gleistunud leostunud muld<br> <strong>KIg</strong> Gleistunud leetjas muld<br> <strong>LPg</strong> Gleistunud kahkjas leetunud muld<br> <strong>LkIg</strong> Gleistunud nõrgalt leetunud muld<br> <strong>LkIIg</strong> Gleistunud keskmiselt leetunud muld<br> <strong>LkIIIg</strong> Gleistunud tugevasti leetunud muld<br> <strong>L(k)Ig</strong> Gleistunud nõrgalt leetunud huumuslik leedemuld<br> <strong>L(k)IIg</strong> Gleistunud keskmiselt leetunud huumuslik leedemuld<br> <strong>L(k)IIIg</strong> Gleistunud tugevasti leetunud huumuslik leedemuld<br> <strong>LIg</strong> Gleistunud nõrgalt leetunud leedemuld<br> <strong>LIIg</strong> Gleistunud keskmiselt leetunud leedemuld<br> <strong>LIIIg</strong> Gleistunud tugevasti leetunud leedemuld<br> <strong>Lsg</strong> Gleistunud sekundaarne leedemul<br> <strong>Gh</strong> Paepealne gleimuld<br><strong>Gkr</strong> Koreserikas rähkne gleimuld<br> <strong>Gk</strong> Rähkne gleimuld<br> <strong>B</strong> Rusukaldemuld<br> <strong>Bg</strong> Gleistunud rusukaldemuld<br> <strong>BG</strong> Rusukalde gleimuld<br> <strong>Tx</strong> Eemaldatud muld<br> <strong>Txg</strong> Gleistunud eemaldatud muld<br> <strong>TxG</strong> Eemaldatud gleimuld<br> <strong>TxM</strong> Eemaldatud madalsoomuld<br> <strong>TxR</strong> Eemaldatud rabamuld<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>'];

//mask_legend_urls = [];
mask_legend_titles = ['- Ei ole mets', '- Ei ole veekogu', '- Ei ole märgala', '- Ei ole lage', '- Alla 10 m', '- Üle 1 m', '- <10m 2008-20'];
mask_titles = ['Mets', 'Veekogu', 'Märgala', 'Lage', 'Üle 10 meetri', 'Alla 1 meetri', '>10m 2008-2020'];
mask_help_text = ['<strong style=font-size:20px;>Mets</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad metsad<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Veekogu</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad veekogud<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Märgala</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad märgalad<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Lagealad</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad lagedad alad<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Üle 10 meetri</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad alad, mille kõrgus on merepinnast üle 10 meetri.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Alla 1 meetri</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad alad, mille kõrgus on merepinnast alla 1 meetri.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>', '<strong style=font-size:20px;>Üle 10 meetri 2008-2020</strong><br><br>Antud kaardikihil on musta värviga kuvatud kõik Eestis asuvad alad, mille kõrgus on merepinnast üle 10 meetri olnud vahemikus 2008-2020.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet<br>'];


orto_legend_urls = ['', '', 'https://teenus.maaamet.ee/ows/wms-satiladu-ndvi?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=NDVI_2021_suvi&format=image/png&STYLE=default&WIDTH=40&HEIGHT=40', 'https://teenus.maaamet.ee/ows/wms-chm?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=CHM2018_suvi&format=image/png&STYLE=default', 'https://teenus.maaamet.ee/ows/wms-chm?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=CHM2018_suvi&format=image/png&STYLE=default', 'https://teenus.maaamet.ee/ows/wms-chm?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=CHM2018_suvi&format=image/png&STYLE=default'];
orto_legend_titles = ['','','','','',''];
orto_alternate_legends = ['','','','','',''];
orto_titles = ['Ortofoto', 'Metsanduslik', 'Taimkatte indeks', 'Taimkate 2018-2021', 'Taimkate 2012-2017', 'Taimkate 2008-2011'];
orto_help_text = ['<strong style=font-size:20px;>Ortofoto</strong><br><br>Eesti topokaardistuse tarbeks toodetud ortofotod on piksli suurusega 20-40 cm ja katavad kogu riigi territooriumi. Tiheasustusega alade ortofotod toodetakse piksli suurusega 10-16 cm. <br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://geoportaal.maaamet.ee/geoportaal.maaamet.ee/est/ruumiandmed/ortofotod-p99.html <br>', '<strong style=font-size:20px;>Metsanduslik ortofoto</strong><br><br> Eesti topokaardistuse tarbeks toodetud ortofotod on piksli suurusega 20-40 cm ja katavad kogu riigi territooriumi. Tiheasustusega alade ortofotod toodetakse piksli suurusega 10-16 cm. <br><br> Metsanduslikud ortofotod valmivad Maa-ametil aeropildistamise käigus. Leica ADS aerokaamera salvestab lisaks punasele, rohelisele ja sinisele värvikanalile ka lähi-ifrapuna kanalit.  <br><br> Metsanduslike ehk n-ö valevärvi ortofotode pealt on võimalik eristada taimkatteta alasid, okas-, sega- ja lehtpuumetsi, niiskeid alasid jm. CIR pilte kasutatakse metsanduses, põllumajanduses, ülikoolides jne erinevate pindade määramisel, mis eristuvad just eriti hästi valevärvi pildilt. <br><br> <strong style=font-size:20px;>Allikas:</strong ><br>https://geoportaal.maaamet.ee/geoportaal.maaamet.ee/est/ruumiandmed/ortofotod-p99.html <br>', '<strong style=font-size:20px;>Taimkatte indeks</strong><br><br>Arvutuslik taimkatteindeks ehk NDVI on indeks, mille abil on mugav hinnata taimkatte tihedust ja taimetervist. Taimedes sisalduv klorofüll peegeldab hästi lähi-infrapunakiirgust (NIR) ja rohelist valgust (G), neelab aga punast (R). NDVI abil saab hinnata, milline on peegeldunud lähi-infrapunakiirguse ja punase kiirguse erinevus. <br>Kui ala NDVI väärtus on positiivne, siis see paistab pildil rohelisena. Mida kõrgem NDVI väärtus, seda rohelisem ja tihedam on taimkate. <br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ndvi-p6.html', '<strong style=font-size:20px;>Eesti taimkatte kõrgusmudel (CHM - Canopy Height Model)</strong><br><br>Taimkatte kõrgusmudel (CHM - Canopy Height Model) näitab taimestiku kõrgust maapinnast.<br><br> Andmed katavad kogu Eestit (välja arvatud väikesed piirkonnad kagupiiril).<br>Mudel on jaotatud kõrgusklassidesse, kus alla 1-meetrise väärtusega pikslid on läbipaistvad. Järgnevad kõrgusklassid on: 1-4 m, 4-10 m, 10-20 m, 20-30 m ja üle 30-meetrise väärtusega pikslid. <br>Arvutamisel on eeldatud, et Eestis ei ole üle 50 meetri kõrguseid puid. <br><br> <strong style=font-size:20px;>Allikas:</strong ><br>https://metadata.geoportaal.ee/geonetwork/inspire/api/records/89c5e3e6-ebd4-4154-bdc9-a9106d10e1b7', '<strong style=font-size:20px;>Eesti taimkatte kõrgusmudel (CHM - Canopy Height Model)</strong><br><br>Taimkatte kõrgusmudel (CHM - Canopy Height Model) näitab taimestiku kõrgust maapinnast.<br><br> Andmed katavad kogu Eestit (välja arvatud väikesed piirkonnad kagupiiril).<br>Mudel on jaotatud kõrgusklassidesse, kus alla 1-meetrise väärtusega pikslid on läbipaistvad. Järgnevad kõrgusklassid on: 1-4 m, 4-10 m, 10-20 m, 20-30 m ja üle 30-meetrise väärtusega pikslid. <br>Arvutamisel on eeldatud, et Eestis ei ole üle 50 meetri kõrguseid puid. <br><br> <strong style=font-size:20px;>Allikas:</strong ><br>https://metadata.geoportaal.ee/geonetwork/inspire/api/records/89c5e3e6-ebd4-4154-bdc9-a9106d10e1b7', '<strong style=font-size:20px;>Eesti taimkatte kõrgusmudel (CHM - Canopy Height Model)</strong><br><br>Taimkatte kõrgusmudel (CHM - Canopy Height Model) näitab taimestiku kõrgust maapinnast.<br><br> Andmed katavad kogu Eestit (välja arvatud väikesed piirkonnad kagupiiril).<br>Mudel on jaotatud kõrgusklassidesse, kus alla 1-meetrise väärtusega pikslid on läbipaistvad. Järgnevad kõrgusklassid on: 1-4 m, 4-10 m, 10-20 m, 20-30 m ja üle 30-meetrise väärtusega pikslid. <br>Arvutamisel on eeldatud, et Eestis ei ole üle 50 meetri kõrguseid puid. <br><br> <strong style=font-size:20px;>Allikas:</strong ><br>https://metadata.geoportaal.ee/geonetwork/inspire/api/records/89c5e3e6-ebd4-4154-bdc9-a9106d10e1b7'];


else_legend_urls = ['https://teenus.maaamet.ee/ows/ai_tuletised?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=ai_surnud_puud&format=image/png&STYLE=default', ''];
else_alternate_legends = ['', "<img src=\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='black'/><circle cx='12' cy='12' r='6' fill='white'/></svg>\" alt=\"Circle Icon\" style=\"margin-right: 8px; width: 1.5em; height: 1.5em; object-fit: contain;\"\">"];
else_legend_titles = ['', '- mesilad'];
else_titles = ['Surnud puud', 'Mesilad'];
else_help_text = ['<strong style=font-size:20px;>Surnud puud</strong><br><br> Tehisaruga tuvastatud surnud puude asukohad Eestis.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>Maa-Amet', '<strong style=font-size:20px;>Mesilad</strong><br><br>PRIA’s registreeritud mesilad<br><br> <strong style=font-size:20px;>Allikas:</strong><br>PRIA (Põllumajanduse Registrite ja Informatsiooni Amet)<br>'];


designed_legend_urls = ['','','https://teenus.maaamet.ee/ows/wms-sentinel-2-ndvi?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=sentinel_2_ndvi_two&format=image/png&STYLE=default','','https://teenus.maaamet.ee/ows/wms-sentinel-2-ndpi?version=1.1.1&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=sentinel_2_ndpi&format=image/png&STYLE=default','','','','','','','','','']
designed_legend_titles = ['','','','','','','','','','','','','',''];
designed_alternate_legends = ['','','','','','','','','','','','','',''];
designed_titles = ['RGB','NRG','NDVI','NGR','NDPI','PNB','NGP','NDR','PDB','NDN','PDN','NNR','DNP','Kujundatud'];
designed_help_text = ['<strong style=font-size:20px;>RGB</strong><br><br>Tavapärane ortofoto - RGB tähistab kolme põhivärvi – punane (Red), roheline (Green) ja sinine (Blue) – mille erinevates kombinatsioonides on võimalik kujutada kogu värvispektrit. Iga värvi intensiivsust mõõdetakse skaalal 0 kuni 255, mis võimaldab luua enam kui 16 miljonit erinevat värvitooni.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://geoportaal.maaamet.ee/geoportaal.maaamet.ee/est/ruumiandmed/ortofotod-p99.html','<strong style=font-size:20px;>NRG (NIR-Red-Green)</strong><br><br>Antud valevärvipilti võib nimetada ka talviseks metsanduslikuks pildiks. Siin valevärvipildil kombineeritakse tagasipeegeldunud lähi-infrapunakiirgust (NIR), punast valgust (Red) ja rohelist valgust (Green). Nähtava spektri punasesse kanalisse on seega asetatud lähi-infrapunakiirguse info, rohelisse kanalisse punase nähtava kiirguse info ning sinisesse kanalisse rohelise valgusspektri info. <br><br> Taimedes sisalduv klorofüll peegeldab hästi lähi-infrapunakiirgust ja rohelist valgust. Lähi-infrapunakiirgust peegeldavad taimed kõige intensiivsemalt ning kuna kuvame seda läbi punase kanali, on ka pildi peal taimkate punast värvi. Erksamad punased on lehtpuud, tumedamad aga okaspuud, mis peegeldavad vähem lähi-infrapunakiirgust. Kui lehtpuud sügise hakul enam rohelised ei ole ning oma lehed langetavad, näeme ka satelliidipildil erisust. Okaspuud kui igihaljad puittaimed püsivad satelliidi valevärvipildil kirsipunased, mil raagus puude alad on rohelised. Kui fotosünteesiv taim peegeldab tagasi lähi-infrapunakiirgust, rohelist ja vähesel määral punast valgust, siis raagus või kahjustunud puude korral rohelise ja lähi-infrapunakiirguse tagasipeegeldumine on väga väike või puuduv ning punase valguse tagasipeegeldumise osakaal suurenenud oluliselt. Kuna sellel valevärvipildi kombinatsioonil kuvame punast valgust läbi rohelise kanali, paistavadki raagus või taimkattevaesed alad rohelised. NRG kombinatsiooni puhul tulevad hästi välja ka puude varjud. <br><br>Erksad punased või roosad on ka kõrgema või tihedama taimkattega põllumassiivid ja rohumaad. Taimkatteta mullased massiivid paistavad rohelisena. Muld peegeldab küll lähi-infrapunakiirgust, aga kuna punase valguse osatähtsus on suurem, paistab selline paljas maapind helerohelist värvi. Seetõttu on ka niidetud rohumaad ja turbaväljad NGR valevärvipildil helerohelised. <br><br><strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/nrg-nir-red-green-p5.html<br>','<strong style=font-size:20px;>NDVI</strong><br><br>NDVI on arvutuslik taimkatteindeks, mille abil on mugav hinnata taimkatte tihedust ja taimetervist. <br> Taimedes sisalduv klorofüll peegeldab hästi lähi-infrapunakiirgust (NIR) ja rohelist valgust (G), neelab aga punast (R). <br> NDVI abil saab hinnata, milline on peegeldunud lähi-infrapunakiirguse ja punase kiirguse erinevus järgmise arvutuseeskirja abil: NDVI = (NIR – R) / (NIR + R). <br><br>Kui ala NDVI väärtus on positiivne, siis see paistab pildil rohelisena. Mida kõrgem NDVI väärtus, seda rohelisem ja tihedam on taimkate. <br> Kui taimkate on hõre, siis peegeldub rohkem punast valgust kui lähi-infrapunakiirgust. Kui alale vastav NDVI väärtus on negatiivne, siis vastav ala on pildil punane. Sellistel aladel on taimkate hõre või taimed kannatavad stressi all. <br>Ka pilved peegeldavad rohkem punast valgust kui lähiinfrapunakiirgust, seetõttu on need ka pildi peal punased. Mõned õhemad pilved võivad paista ka kollastena. Tehispinnad on samuti toonis kollasest punaseni. <br> <br><strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ndvi-p6.html<br>','<strong style=font-size:20px;>NGR</strong><br><br>NGR valevärvipildil kombineeritakse tagasipeegeldunud lähi-infrapunakiirgust (NIR), rohelist valgust (Green) ja punast valgust (Red). Nähtava spektri punasesse kanalisse on seega asetatud lähi-infrapunakiirguse info, rohelisse kanalisse rohelise nähtava kiirguse info ning sinisesse kanalisse punase valgusspektri info. <br><br> Taimedes sisalduv klorofüll peegeldab hästi lähi-infrapunakiirgust ja rohelist valgust. Valevärvipildil tähendaks see punase ja rohelise valguse kombineerimist, mis RGB-mudeli korral paistab oranžina. Kuna lehtpuud peegeldavad intensiivsemalt lähi-infrapunakiirgust kui okaspuud, siis neid on värvi järgi lihtne eristada. Lehtmetsad paistavad seetõttu tekstuurse tumeoranžina, okasmetsad on aga tumerohelistena. Seetõttu annab NGR pilt hea ülevaate metsade koosseisust. <br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ngr-p7.html<br>','<strong style=font-size:20px;>NDPI</strong><br><br>NDPI on arvutuslik veekogude indeks, mille abil on võimalik hinnata taimkatte veesisaldust. See leitakse omavahel võrreldes tagasipeegeldunud lühilainelist infrapunakiirgust (SWIR) tagasipeegeldunud rohelise valgusega (G).<br><br> Kui alalt peegeldub rohkem rohelist valgust kui lühilainelist infrapunakiirgust, siis on indeks negatiivse väärtusega. Kaardil on selline ala sinisest tumesiniseni. Sellist värvi on üldiselt veekogud ja veega küllastunud taimkate. <br> <br> Tuleb arvestada, et kuigi NDPI on üsna efektiivne pinnavee ja veega küllastunud taimkatte tuvastamisel, on selle tuvastus piiratud õhukese maa pealmise pinna kihiga ning tundub olevat kõige valiidsem ajal, mil taimkate on roheline. Lisaks esineb teatud piiranguid seoses märgaladega. <br> Talvisel ajal saab filtri abil hinnata, millised alad on lumikatte all ja millised mitte. Lumised alad on sinised, lumikatteta alad aga kollased. <br> <br>  <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ndpi-p8.html<br>','<strong style=font-size:20px;>PNB</strong><br><br>PNB valevärvipildi peal kombineeritakse arvutuslikku veekogude indeksit (NDPI), tagasipeegeldunud lähi-infrapunakiirgust (NIR) ja sinist valgust.<br><br>Taimedes sisalduv klorofüll peegeldab hästi lähi-infrapunakiirgust, sinist valgust aga oluliselt vähem. Heas seisus taimedel on ka madal NDPI väärtus, mis tähendab, et veesisaldus on neil piisav. Seetõttu on terve taimkattega alad pildil rohelist värvi. Helerohelised on sellised alad, kus klorofülli sisaldus taimedes on suur ja ka veesisaldus piisav. Sellised on näiteks niitmata põllud ja lehtpuud. Okaspuud peegeldavad veidi vähem lähi-infrapunakiirgust võrreldes lehtpuudega. Seetõttu paistavad need pildil pruunikas-rohelisena. <br><br>Niidetud põllud on aga erkroosad. Seda seetõttu, et sellistel aladel paistab välja muld, mille NDPI väärtus on kõrge, kuid lähi-infrapuna ja sinisest spektri piirkonnast peegeldub vähem valgust. Roosa värv tähendab aga seda, et suur panus on ka sinisel värvil. Seda seetõttu, et sinise kanali osatähtsus on sellise filtri korral suurim. Põllud, kus on hõre taimkate, paistavad tumesinistena, kuna taimede vahelt paistab välja ka muld.<br><br>Turbaväljadel on kõrge NDPI väärtus ning nendelt peegeldub vähe sinist valgust ja lähiinfrapunakiirgust. Seetõttu paistavad need punastena. Sama tooni on ka rabad<br><br>Veekogudel on enamjaolt madal NDPI väärtus, samuti neelavad need hästi lähiinfrapunakiirgust. Need peegeldavad vähesel määral sinist valgust, seetõttu on need pildi peal tumesinised. Pilved peegeldavad nii lähiinfrapunakiirgust kui ka sinist valgust, NDPI väärtus on neil madal. Seetõttu on need helesinist värvi. <br><br><strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/pnb-p9.html<br>','<strong style=font-size:20px;>NGP</strong><br><br>NGP valevärvipildi peal kombineeritakse tagasipeegeldunud lähi-infrapunakiirgust (NIR), rohelist valgust ja arvutuslikku veekogude indeksit (NDPI). Taimedes sisalduv klorofüll peegeldab hästi lähi-infrapunakiirgust ja rohelist valgust. Heas seisus taimedel on ka madal NDPI väärtus, mis tähendab, et veesisaldus on neil piisav. Seetõttu on taimkattega alad pildil kollasest oranžini. Tumeoranžid on sellised alad, kus klorofülli sisaldus taimedes on suur ja ka veesisaldus on piisav. Sellised on näiteks niitmata põllud ja lehtpuud. Okaspuud peegeldavad veidi vähem lähi-infrapunakiirgust võrreldes lehtpuudega. Seetõttu paistavad need pildil tumerohelistena. Niidetud põllud on aga helesinised. Seda seetõttu, et sellistel aladel paistab välja muld, mille NDPI väärtus on kõrge. Hõreda taimkattega põldude värv varieerub rohelisest helesiniseni, kuna taimede vahelt paistab välja ka muld. Turbaväljadel on kõrge NDPI väärtus ja nendelt peegeldub vähe rohelist valgust. Seetõttu paistavad need sinistena. Sama tooni on ka rabad. Veekogudel on enamjaolt madal NDPI väärtus, samuti neelavad need hästi lähi-infrapunakiirgust. Need peegeldavad vähesel määral vaid rohelist valgust, seetõttu on need pildi peal tumerohelised. Pilved aga peegeldavad lisaks rohelisele valgusele ka lähi-infrapunakiirgust, NDPI väärtus on neil madal. Seetõttu on pilved pildi peal kollased. Sama värvi on ka lumi. Tehisalad tunneb ära helerohelise värvi poolest.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ngp-p10.html<br>','<strong style=font-size:20px;>NDR</strong><br><br>NDR valevärvipildi peal kombineeritakse tagasipeegeldunud lähi-infrapunakiirgust (NIR), punast valgust ja arvutuslikku taimkatte indeksit (NDVI). Taimkatteindeksi abil saab hinnata vaadeldava ala taimkatte tihedust ja selle tervist. Mida kõrgem on indeksi väärtus, seda rohkem rohelust on vaadeldavas piirkonnas. Tihe taimkate peegeldab ka palju lähi-infrapunakiirgust. Vähe peegeldatakse punast valgust, kuna seda taim neelab ja kasutab fotosünteesiks. Seetõttu paistavad taimkattega alad pildil rohelisest kollaseni. Kollastena paistavad põllumaad, samuti ka lehtpuud. Okaspuud aga peegeldavad vähem lähi-infrapunakiirgust ja seetõttu on pildil rohelised. Hõreda taimkattega põllud on pildil roosat värvi. Niidetud põllud on lillast tumesiniseni, kuna paistab välja muld, mis peegeldab hästi punast valgust ja lähi-infrapunakiirgust. Ka turbaväljad ja tehisalad on tumesinised. Tumelillad on ka rabad. Veekogud neelavad hästi valgust kogu vaadeldavast spektri piirkonnast, ka NDVI väärtus on neil madal. Seetõttu paistavad need pildi peal mustana. Talvisel ajal paistab lumi pildil roosana, okaspuud on aga rohelised. <br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ndr-p11.html<br>','<strong style=font-size:20px;>PDB</strong><br><br>PDB valevärvipildi peal kombineeritakse arvutuslikku veekogude indeksit (NDPI), taimkatteindeksit (NDVI) ja sinist valgust. NDVI abil on võimalik hinnata vaadeldava ala rohelust. Mida suurem on NDVI väärtus ala kohta, seda tihedam ja tervem on taimkate. NDPI abil saab aga hinnata taimkatte veesisaldust. Mida suurem on taimkatte veesisaldus, seda väiksem on NDPI väärtus. Mida suurem on NDPI väärtus, seda rohkem peegeldab ala lühilainelist infrapunakiirgust võrreldes rohelise valgusega. Pildil paistavad hästi välja sellised alad, kus NDVI väärtus on väike, NDPI väärtus aga suur. Fuktsiaroosana paistavad näiteks niidetud põllud, punasena turbaväljad. Kui on tegemist tiheda taimkattega alaga, kus NDVI väärtus on suur ja NDPI väärtus madal, siis ala paistab rohelisena. Tumerohelistena paistavad okaspuud, veidi heledamana aga lehtpuud. Ka põllud on helerohelised. Veekogud neelavad hästi sinist valgust, samuti on neil väike NDVI ja NDPI väärtus, seetõttu on need pildil tumesinised või mustad. Tehispinnad on tumesinised. Talvisel ajal on paistab lumi pildil sinisena. Alad, mis ei ole paksu lume all on rohelised kuni oranžid, valdavalt aga kollased.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/pdb-p12.html<br>','<strong style=font-size:20px;>NDN</strong><br><br>NDN valevärvipildi korral kombineeritakse omavahel arvutuslikku taimkatteindeksit (NDVI) ning tagasipeegeldunud lähi-infrapunakiirgust (NIR). Mida rohkem rohelust on vaadeldavas piirkonnas, seda suurem on NDVI väärtus. Lisaks sellele saab rohelust hinnata ka otse tagasipeegeldunud lähi-infrapunakiirgust mõõtes. Sellised alad, kus NDVI väärtus on kõrge ja peegeldub ka palju lähi-infrapunakiirgust, on pildil valged. Sellised alad on näiteks niitmata põllud, mis pildil paistavad selgete piiridega valgete laikudena. Lisaks paistavad valgetena ka lehtmetsad. Okaspuudelt peegeldub mõnevõrra vähem lähi-infrapunakiirgust, seetõttu on okasmetsad rohelist värvi. Rohelised on ka sellised põllulapid, kus suurt taimekasvu veel ei ole. Hästi eristatavad on veel niidetud põllud, mis pildil on tumeroosad. Seda seetõttu, et mulla NDPI väärtus on kõrge. Sarnast värvi on ka turbaväljad, kuid mõnevõrra tuhmimad. Hästi eristatavad on ka tehisalad, mis on samuti roosad, kuid turbaväljadega võrreldes erksamat tooni. Veekogud on pildil mustad, kuna vesi peegeldab vähe lähi-infrapunakiirgust. Pilved on pildil roosat värvi, kuna need peegeldavad hästi lähiinfrapunakiirgust. Talvisel ajal paistab lumi roosana, kuna see peegeldab hästi lähi-infrapunakiirgust. Alad, mis ei ole paksu lumikatte all, on aga rohelist värvi.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/ndn-p13.html<br>','<strong style=font-size:20px;>PDN</strong><br><br>PDN valevärvipildi korral kombineeritakse omavahel arvutuslikku veekogude indeksit (NDPI), taimkatteindeksit (NDVI) ning tagasipeegeldunud lähi-infrapunakiirgust (NIR). Valevärvipilt on mõeldud eelkõige talvisel ajal tehtud piltide uurimiseks. Taimkatte indeksi abil on võimalik hinnata ala taimkatte tihedust ja selle tervist. Seda määratakse tagasipeegeldunud lähiinfrapunakiirguse ja punase valguse erinevuse järgi. Taimedes sisalduv klorofüll peegeldab rohkem lähi-infrapunakiirgust kui punast valgust. Tänu sellele on võimalik eristada okaspuid raagus puudest. Hästi paistavad välja okaspuud, mis kõrge NDVI ja NDPI tõttu on pildil kollased. Sellised alad, kus on raagus puud, on pildil rohelised. Lumi on aga pildil tumesinine. Suvel tehtud piltidel paistavad niitmata põllud ja lehtpuud helesinistena, okaspuud aga rohelistena. Seda seetõttu, et okaspuudes on vähem klorofülli kui lehtpuudes. Niidetud või lagedad alad on aga punased. Seda seetõttu, et paistab välja muld, mis peegeldab hästi lühilainelist infrapunakiirgust. Sellest tulenevalt on mulla NDPI väärtus kõrge. Oranžid või punased on ka turbaväljad. Veekogud on mustad, kuna nende NDPI on väga väike ning need neelavad hästi ka lähi-infrapunakiirgust.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/pdn-p14.html<br>','<strong style=font-size:20px;>NNR</strong><br><br>NNR valevärvipildi korral kombineeritakse omavahel tagasipeegeldunud lähiinfrapunakiirgust (NIR) ja punast valgust. Kuna taimedes sisalduv klorofüll peegeldab tagasi lähiinfrapunakiirgust ja neelab punast valgust, siis taimkattega alade värv varieerub rohelisest helekollaseni. Talvisel ajal saab eristada okasmetsa raagus puudest. Okaspuud peegeldavad ka talvel lähi-infrapunakiirgust, kuna need on igihaljad. Seetõttu on okaspuud pildil rohelised. Alad, kus on vaid raagus puud, paistavad aga sinistena. Lumi peegeldab hästi valgust kogu vaadeldavas spektraalpiirkonnas. Seetõttu paistavad paksu lumikatte all olevad alad valgetena. Veekogud neelavad hästi valgust kogu antud spektraalpiirkonnast, seetõttu on need mustad. Seetõttu paistavad hästi välja ka veekogude piirid. Suvisel ajal on taimkate tihedam ning seetõttu ka tagasipeegeldunud lähi-infrapunakiirguse hulk suurem. Seega on taimkattega alad rohelised või eriti suure klorofüllisisalduse puhul ka kollased. Niidetud või lagedad alad on aga sinised. Seda seetõttu, et paistab välja muld, mis peegeldab hästi nii punast valgust kui ka lähi-infrapunakiirgust. Kuna aga punase valguse osatähtsus on pildil suurem, siis muld paistab ikkagi sinisena. Ka turbaväljad ja rabad on pildil sinist värvi.<br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/nnr-p15.html<br>','<strong style=font-size:20px;>DNP</strong><br><br>DNP valevärvipildi korral kombineeritakse omavahel arvutuslikku taimkatte indeksit (NDVI), veekogude indeksit (NDPI) ning tagasipeegeldunud lähi-infrapunakiirgust (NIR). Taimkatte indeksi abil on võimalik hinnata ala taimkatte tihedust ja selle tervist. Seda määratakse tagasipeegeldunud lähi-infrapunakiirguse ja punase valguse erinevuse järgi. Taimedes sisalduv klorofüll peegeldab rohkem lähi-infrapunakiirgust kui punast valgust. Seetõttu võivad taimkattega alad olla pildi peal punased. Sellised alad on näiteks okasmetsad. Eriti suure klorofülli sisalduse korral on taimestik pildil kollane. Sellisteks aladeks on näiteks lehtmetsad ja niitmata põllud. <br><br>Niidetud põllud on sinised, kuna paistab välja muld, mille NDPI väärtus on kõrge. Turbaväljade värv varieerub roosast tumesiniseni. Roosad on ka rabad. Veekogud on aga mustad, kuna nende NDPI on minimaalne ning need neelavad ka hästi lähi-infrapunakiirgust. Tehisalad ja pilved on pildi peal rohelised. Talvisel ajal paistab pildil lumi rohelisena ja roosana paistavad okaspuud. Raagus puud on pildil aga oranžid. <br><br> <strong style=font-size:20px;>Allikas:</strong><br>https://ehwebtest.maaamet.ee/est/abi/dnp-p16.html<br>','Kujundatud'];

//    function showLegendTable(urls,titles, bottom, left, index, type) {
//    let legendName = 'legendTable' + type + "-" + index;
//    let tableName = 'tableContainer' + type + "-" + index;;
//    const tableContainer = document.getElementById(tableName);
//    const legendTable = document.getElementById(legendName);
//    console.log(tableContainer);
//    // Clear previous table content
//    legendTable.innerHTML = '';
//    let tableContent = `
//        <tr><th colspan="1" style="color: black;">Legend</th></tr>
//    `;
//
//    // Adjust the position of the table container
//    tableContainer.style.bottom = bottom;
//    if (type != 'Designed') tableContainer.style.left = left;
//    else tableContainer.style.right = left;
//
//    fetch(urls[index])
//        .then(response => response.blob())
//        .then(blob => {
//            const imageUrl = URL.createObjectURL(blob);
//            // Append new row to the existing table content
//            const rowContent = `
//                <tr>
//                    <td style="color: black; display: flex; align-items: center; font-size: 14px;">
//                        <img src="${imageUrl}" alt="Legend Image" style="margin-right: 8px;"> ${titles[index]}
//                    </td>
//                </tr>
//            `;
//            console.log(rowContent);
//            tableContent += rowContent;
//            legendTable.innerHTML += tableContent;
//        })
//        .catch(error => console.error('Error fetching legend:', error));
//
//    // Display the table container
//    tableContainer.style.display = 'block';
//}
//
//    function hideTable() {
//        const tableContainer = document.getElementById('tableContainer');
//        tableContainer.style.display = 'none';
//    }
//
//document.addEventListener('DOMContentLoaded', () => {
//    const legendButtons = document.querySelectorAll('.LegendButtonBorders');
//    legendButtons.forEach((button) => {
//        button.addEventListener('mouseenter', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            showLegendTable(borders_legend_urls, borders_legend_titles, '10em', '12em', buttonId, 'Borders');
//        });
//        button.addEventListener('mouseleave', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            let tableName = 'tableContainerBorders-' + buttonId;
//            const tableContainer = document.getElementById(tableName);
//            tableContainer.style.display = 'none';
//        });
//    });
//});
//
//document.addEventListener('DOMContentLoaded', () => {
//    const legendButtons = document.querySelectorAll('.LegendButtonOrto');
//    legendButtons.forEach((button) => {
//        button.addEventListener('mouseenter', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            showLegendTable(orto_legend_urls, orto_legend_titles, '0em', '14em', buttonId, 'Orto');
//        });
//        button.addEventListener('mouseleave', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            let tableName = 'tableContainerOrto-' + buttonId;
//            const tableContainer = document.getElementById(tableName);
//            tableContainer.style.display = 'none';
//        });
//    });
//});
//
//document.addEventListener('DOMContentLoaded', () => {
//    const legendButtons = document.querySelectorAll('.LegendButtonElse');
//    legendButtons.forEach((button) => {
//        button.addEventListener('mouseenter', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            showLegendTable(else_legend_urls, else_legend_titles, '0em', '12em', buttonId, 'Else');
//        });
//        button.addEventListener('mouseleave', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            let tableName = 'tableContainerElse-' + buttonId;
//            const tableContainer = document.getElementById(tableName);
//            tableContainer.style.display = 'none';
//        });
//    });
//});
//
//document.addEventListener('DOMContentLoaded', () => {
//    const legendButtons = document.querySelectorAll('.LegendButtonDesigned');
//    legendButtons.forEach((button) => {
//        button.addEventListener('mouseenter', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            showLegendTable(designed_legend_urls, designed_legend_titles, '20em', '8em', buttonId, 'Designed');
//        });
//        button.addEventListener('mouseleave', (event) => {
//            const buttonId = event.target.id.slice(-1);
//            let tableName = 'tableContainerDesigned-' + buttonId;
//            const tableContainer = document.getElementById(tableName);
//            tableContainer.style.display = 'none';
//        });
//    });
//});

let isPopupVisible = false;

    function openLegendInfoBox(content) {
        const legendInfo = document.getElementById('LegendInfo');
        legendInfo.innerHTML = content;
        const legendInfoBox = document.getElementById('D-LegendInfo');

        if (isPopupVisible) {
            legendInfoBox.style.visibility = 'hidden';
        } else {
            legendInfoBox.style.visibility = 'visible';
        }

        isPopupVisible = !isPopupVisible;
    }

function addLegend(urls, legendTitles, titles,  index, legendTable, helpText, alternate_legend_pictures) {
    if (urls[index] == ""){
        if (alternate_legend_pictures[index] == ""){


        const sentence = helpText[index];
            // Create a unique ID for the text box
            const textBoxId = `textBox-${index}`;

            // Append new row to the existing table content
            const rowContent = `
                <tr>
                    <td style="color: white; font-size: 16px; text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong>${titles[index]}</strong>
                            <div onclick="openLegendInfoBox('${sentence}')" style="cursor: pointer; margin-left: 8px; justify-content: right;">
                            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10' stroke='white' stroke-width='2' fill='none'/><text x='12' y='17' text-anchor='middle' font-size='15' fill='white'>i</text></svg>" alt="Info button icon" style="width: 1.5em; height: 1.5em; object-fit: contain;">
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; font-size: 14px; justify-content: left; margin-top: 8px;">
                             Legend puudub
                        </div>
                    </td>
                </tr>
            `;

            legendTable.innerHTML += rowContent;
        }
        else{

        const sentence = helpText[index];
            // Create a unique ID for the text box
            const textBoxId = `textBox-${index}`;

            let rowContent = `
                <tr>
                    <td style="color: white; font-size: 16px; text-align: center;" ${alternate_legend_pictures[index] === '- põldude piir' ? 'rowspan="2"' : ''}>
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong>${titles[index]}</strong>
                            <div onclick="openLegendInfoBox('${sentence}')" style="cursor: pointer; margin-left: 8px; justify-content: right;">
                                <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10' stroke='white' stroke-width='2' fill='none'/><text x='12' y='17' text-anchor='middle' font-size='15' fill='white'>i</text></svg>" alt="Info button icon" style="width: 1.5em; height: 1.5em; object-fit: contain;">
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; font-size: 14px; justify-content: left; margin-top: 8px;">
                            ${alternate_legend_pictures[index]}
                            <span>${legendTitles[index]}</span>
                        </div>
            `;

            if (legendTitles[index] === '- põldude piir') {
                rowContent += `
                        <div style="display: flex; align-items: center; font-size: 14px; justify-content: left; margin-top: 8px;">
                            <strong style="color: black;">47152508845</strong>
                            <span style="color: white; margin-left: 4px;">- põllu number</span>
                        </div>
                    `;
            }

            rowContent += `
                    </td>
                </tr>
            `;

            legendTable.innerHTML += rowContent;
        }
    }

    else{
    fetch(urls[index])
        .then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            // Append new row to the existing table content
            const sentence = helpText[index];
            // Create a unique ID for the text box
            const textBoxId = `textBox-${index}`;

            // Append new row to the existing table content
            const rowContent = `
            <tr>
                <td style="color: white; font-size: 16px; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <strong>${titles[index]}</strong>
                        <div onclick="openLegendInfoBox('${sentence}')" style="cursor: pointer; margin-left: 8px; justify-content: right;">
                            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10' stroke='white' stroke-width='2' fill='none'/><text x='12' y='17' text-anchor='middle' font-size='15' fill='white'>i</text></svg>" alt="Info button icon" style="width: 1.5em; height: 1.5em; object-fit: contain;">
                            </div>
                    </div>
                    <div style="display: flex; align-items: center; font-size: 14px; justify-content: left; margin-top: 8px;">
                        <img src="${imageUrl}" alt="Legend Image" style="margin-right: 8px;">
                        ${legendTitles[index]}
                    </div>
                </td>
            </tr>
            `;

            legendTable.innerHTML += rowContent;

        })
        .catch(error => console.error('Error fetching legend:', error));
}
}



function addLegendMask(image, legendTitles, titles, index, legendTable, helpText){
    const sentence = helpText[index];
    const rowContent = `
                <tr>
                    <td style="color: white; font-size: 16px; text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <strong>${titles[index]}</strong>
                            <div onclick="openLegendInfoBox('${sentence}')" style="cursor: pointer; margin-left: 8px; justify-content: right;">
                            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10' stroke='white' stroke-width='2' fill='none'/><text x='12' y='17' text-anchor='middle' font-size='15' fill='white'>i</text></svg>" alt="Info button icon" style="width: 1.5em; height: 1.5em; object-fit: contain;">
                            </div>
                        </div>
                        <div style="display: flex; align-items: center;font-size: 14px; justify-content: left; margin-top: 8px;">
                            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><rect x='4' y='4' width='16' height='16' rx='2' ry='2' stroke='black' stroke-width='2' fill='black'/></svg>" alt="Black Box Icon" style="margin-right: 8px;width: 1.5em; height: 1.5em; object-fit: contain;">
                            ${legendTitles[index]}
                        </div>
                    </td>
                </tr>
            `;
            legendTable.innerHTML += rowContent;

}


let lastUrl = '';
function generateLegendTable() {
    const currentUrl = window.location.href;
    const queryString = window.location.search;
    const cleanQueryString = queryString.substring(1);
    const queryParamsArray = cleanQueryString.split('&');

    const excludeKeys = ['mapbox', 'sensor', 'date'];
    const filteredParamsArray = queryParamsArray.filter(param => {
    const key = param.split('=')[0];
    return !excludeKeys.includes(key);
});
    const tableContainer = document.getElementById(tableContainerAllLegends);
    const legendTable = document.getElementById(legendTableAllLegends);
    const filteredParamsString = filteredParamsArray.sort().join('&');

    if (lastUrl != filteredParamsString){
    legendTableAllLegends.innerHTML = '';
    filteredParamsArray.forEach(param => {
        const key_value = param.split('=');
        if (key_value[0] == 'filter'){
            let index = -1
            for(let k=0; k <= ProductsWMS.length; k++){
                if (ProductsWMS[k].toLowerCase() == key_value[1]) {
                    index = k;
                    break;
                }
            }
            addLegend(designed_legend_urls,designed_legend_titles, designed_titles,index, legendTableAllLegends, designed_help_text, designed_alternate_legends);
        }
        else if (key_value[0] == 'borders'){
            addLegend(borders_legend_urls,borders_legend_titles, borders_titles, key_value[1],legendTableAllLegends, borders_help_text, borders_alternate_legends);
        }
        else if (key_value[0] == 'orto'){
            addLegend(orto_legend_urls,orto_legend_titles,orto_titles, key_value[1],legendTableAllLegends, orto_help_text, orto_alternate_legends);
        }
        else if (key_value[0] == 'mask'){
            addLegendMask('../mask_legend.png',mask_legend_titles,mask_titles, key_value[1], legendTableAllLegends, mask_help_text);
        }
        else if (key_value[0] == 'deadtrees'){
            addLegend(else_legend_urls,else_legend_titles, else_titles,0, legendTableAllLegends, else_help_text, else_alternate_legends);
        }
        else if (key_value[0] == 'points'){
            addLegend(else_legend_urls,else_legend_titles, else_titles ,1, legendTableAllLegends, else_help_text, else_alternate_legends);
        }

        });

    }
    lastUrl = filteredParamsString;
    }

document.addEventListener('DOMContentLoaded', generateLegendTable);

document.addEventListener('click', function(event) {
    generateLegendTable();
});

document.addEventListener('DOMContentLoaded', () => {
    const legendButton = document.getElementById('legendButtonAllLegends');
    const tableContainer = document.getElementById('tableContainerAllLegends');

    legendButton.addEventListener('click', (event) => {
        if (tableContainer.style.display === 'block' || tableContainer.style.display === '') {
            tableContainer.style.display = 'none';
            legendButton.className = "buttonno";
        } else {
            tableContainer.style.display = 'block';
            legendButton.className = "buttonnoy";
        }
    });
});


