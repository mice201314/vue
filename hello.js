(function() {
    var apiNames = {
        share: "AppShare",
        scan: "AppScan",
        backToApp: "backToApp"
    };

    var userAgent = window.navigator.userAgent.toUpperCase();
    var isAnroid = (function() {
        return userAgent.indexOf("ANDROID") != -1;
    })();
    var isIos = (function() {
        return userAgent.indexOf("MAC OS") != -1;
    })();

    var nativeBridge = function(name, param, cbName) {
        if (isAnroid) {
            window.JSInterface[name](cbName, JSON.stringify(param));
        } else if (isIos) {
            window[name](cbName, JSON.stringify(param));
        }
    };

    var callNative = function(name, param, callback) {
        if (typeof callback != "function") {
            callback = param;
        }
        var cbName = "_NATIVE_CB_" + name;
        window[cbName] = function(data) {
            var jsonData = typeof data == "string" ? JSON.parse(data) : data;
            callback(jsonData);
        };
        try {
            nativeBridge(name, param, cbName);
        } catch {
            console.warn("非App环境!");
            window[cbName]();
        }
    };

    var native = {
        isAnroid: isAnroid,
        isIos: isIos
    };
    for (var key in apiNames) {
        native[key] = function(param, callback) {
            callNative(apiNames[key], param, callback);
        };
    }

    window.Native = native;
})();
