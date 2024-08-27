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

var wmsLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://ixgsmap2.ymparisto.fi/geoserver/eo/ows?',
    params: {
      'LAYERS': 'TARKKA_baltic_sea_water_area',
      'TILED': true,
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver'
  }),
  opacity: 0.6 // Adjust opacity as needed
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
      console.log(currentDate);
      generateLegendTable()
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
  currentDate = sensedate[witchActive];
  console.log(sensedate[witchActive]);
  generateLegendTable();
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
  generateLegendTable();
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
var ClmsWMS = ['https://geoserver2.ymparisto.fi/geoserver/eo/ows?service=wms&version=1.3.0&request=GetCapabilities'];
var ClmsMatrixSet = ['EPSG:3067'];
var ClmsParser = [new ol.format.WMSCapabilities()];
var ClmsOptions = [undefined, undefined];
var ClmsLayer = [undefined, undefined];
var Clms=-1;
let number2 = -1;
function setClms(nr) {
  number2 = nr;
  console.log('jõudsin siiani');
  if (nr==-1 || nr==Clms) {
    ClmsLayerGroup.setVisible(false);
    Clms=-1;
    document.getElementById('clms-0').className="buttonno";
    console.log('false');
  } else {
    ClmsLayerGroup.setVisible(true);
    Clms = nr;
    console.log('true');
    document.getElementById('clms-0').className="buttonnoy";
    if (ClmsLayer[nr] === undefined) loadClms(nr);
    }


  onMoveEnd(false);
}

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


//document.getElementById('clms-0').addEventListener('click', function() {
//  console.log('midagi muutus');
//  var isVisible = wmsLayer.getVisible();
//  wmsLayer.setVisible(!isVisible);
//});
