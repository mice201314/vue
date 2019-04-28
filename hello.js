//建立native的方法名和id的映射, 方便查看
const BACK_TO_APP = 'backToApp';
const GO_TO_LOGIN_PAGE = 'goToLoginPage';
const GO_TO_HOSPITAL_LISTS = 'goToHospitalLists';
const GO_TO_MEMBER_CARD = 'goToMemberCard';
const GO_TO_BING_INSURANCE = 'goToBingInsurance';
const SET_NAVIGATION_BAR_BASE = 'setNavigationBarBase';
const SET_TALKING_DATA = 'setTalkingData';
const IS_SHOW_PROGRESS_DIALOG = 'isShowProgressDialog';
const GET_STEP_COUNTBYTIME = 'getStepCountByTime';
const GET_SYSTEM_PATH = 'getSystemPath';
const GET_USER_INFO = 'getUserInfo';
const GO_WX_MIN_PROGRAM = 'goWXMinProgram';
const  GO_TO_QY_SESSION = "goToQYSession";     
const  GO_TO_PAGE = "goToPage"; //13：跑步  15：制定计划   
const  GET_SPORT_BURN_CALORIES = "getSportBurnCalories"; //跑步     

// 有回调的方法
const HAVE_CALLBACK_NAMES = [
    BACK_TO_APP,
    SET_NAVIGATION_BAR_BASE,
    SET_TALKING_DATA,
    GET_STEP_COUNTBYTIME,
    GET_SYSTEM_PATH,
    GET_USER_INFO,
    GO_TO_LOGIN_PAGE,
    GO_TO_QY_SESSION,
    GO_WX_MIN_PROGRAM,
    GET_SPORT_BURN_CALORIES
];
// 没有回调的方法
const NO_CALLBACK_NAMES = [
    GO_TO_HOSPITAL_LISTS,
    GO_TO_MEMBER_CARD,
    GO_TO_BING_INSURANCE,
    IS_SHOW_PROGRESS_DIALOG,
    GO_TO_PAGE
];

const NAMES = HAVE_CALLBACK_NAMES.concat(NO_CALLBACK_NAMES);





const IS_DEBUG = process.env.NODE_ENV.trim() === 'development';

//取userAgent
const ua = window.navigator.userAgent.toUpperCase();

const isAndroidFunc = function (ua) {
    return ua.indexOf('ANDROID') !== -1;
};

const isIosFunc = function (ua) {
    return ua.indexOf('MAC OS') !== -1;
};
const isIos11Fun = function (ua) {
    return ua.indexOf("OS 11") !== -1;

};
const isAndroid = isAndroidFunc(ua);

const isIos = isIosFunc(ua);
const isIOS11 = function(){return isIos11Fun(ua)};
const createRandomNum = function (num) {
    const arr = [ ];
    const $num = num || 6;

    for(let i = 0; i < $num; i++) {
        arr.push(~~(Math.random()*10));
    }

    return arr.join("");
};

var createCbname = function (name, num) {
    return "_NATIVE_CB_" + name + "_" + createRandomNum(num);
};

var iosCallNative = function (name, cbname, opt) {
    if(!opt){
      var opt = {};
    }
    opt.callBackName = cbname;
    window.webkit.messageHandlers[name].postMessage(opt);
};

var androidCallNative = function (name, cbname, opt) {

    if( opt ) {
        window.AndroidJSInterface[ name ]( JSON.stringify(opt), cbname );
    } else {
        window.AndroidJSInterface[ name ]( cbname );
    }
};

let callNative;

if (isAndroid) {
    callNative = androidCallNative;
} else if (isIos) {
    callNative = iosCallNative;
}

var callNative$1 = function (name, opt) {
    return  new Promise(function (resolve, reject) {
        const cbname = createCbname(name);

        window[cbname] = async function (data) {
          await resolve(data);
          //这里进行销毁
          await (window[cbname] = null);
          // todo reject
        };

        try{
          callNative(name, cbname, opt);
        }catch (e){
          if(name == "getSystemPath"){
            let version = location.href.match(/appVersion=([\w\.]+)/);
            window[cbname]({statusCode:0,data:{deviceID:"no deviceID","appVersion":version?version[1]:new Date().getTime()}});
          }else if(name == "goWXMinProgram"){
              console.log("no goWXMinProgram");
          }else{
            window[cbname]();
          }

        }
    });
};

const native = { };
//是否为IOS11
native.isIOS11 = isIOS11;
// 给native扩展方法
const extendNativeMethod = function () {
    for (let i = 0, len = NAMES.length; i < len; i++) {
        let name = NAMES[i];

        native[name] = function (pramas) {
            
            return callNative$1(name, pramas);
        };
    }
};

extendNativeMethod();

let language = '';
let languageSuffix = '';
// 设置语言
native.setLanguage = function (lang) {
    language = lang.toLocaleLowerCase();
    languageSuffix = '_' + language;
};
// 附加更语义化的API, 调用extend方法附加的API,
// 尽量避免参数有魔鬼数字和Boolean值
/* 导航栏相关 */
// 设置导航栏标题
native.setNavigationTitle = function (title, fn) {
    var cb = fn || function(){};
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '3',
        value: title
    }, cb);
};
// 显示导航栏右侧按钮
native.showNavigationForward = function () {
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '2',
        value: 'true'
    });
};
// 隐藏导航栏右侧按钮
native.hideNavigationForward = function () {
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '2',
        value: 'false'
    });
};
// 显示导航栏左侧返回按钮
native.showNavigationBack = function () {
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '1',
        value: 'true'
    });
};
// 隐藏导航栏左侧返回按钮
native.hideNavigationBack = function () {
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '1',
        value: 'false'
    });
};
// 显示导航栏左侧关闭按钮
native.showNavigationClose = function () {
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '5',
        value: 'true'
    });
};
// 隐藏导航栏左侧关闭按钮
native.hideNavigationClose = function () {
    return this[SET_NAVIGATION_BAR_BASE]({
        actionType: '5',
        value: 'false'
    });
};
/* 埋点相关, 如果设置了语言, 会自动加上后缀 */
// 设置事件类型的埋点
native.setEventTalkingData = function (data) {
    return this[SET_TALKING_DATA]({
        actionType: '1',
        value: data + languageSuffix
    });
};
// 设置进入页面的埋点
native.setEnterPageTalkingData = function (data) {

    return this[SET_TALKING_DATA]({
        actionType: '2',
        value: data + languageSuffix
    });
};
// 设置退出页面的埋点
native.setExitPageTalkingData = function (data) {
    return this[SET_TALKING_DATA]({
        actionType: '3',
        value: data + languageSuffix
    });
};

//七鱼会话
// native.goToQYSession = function (data) {
//     return this[GO_TO_QY_SESSION](data);
// };


/* 判断机器类型 */
native.isIos = function () {
    return isIos;
};
native.isAndroid = function () {
    return isAndroid;
};

export default native;
