!(function(window, factory) {
  'function' == typeof define && (define.amd || define.cmd)
    ? define(function() {
        return factory(window);
      })
    : factory(window, !0);
})(this, function(win, noGlobal) {
  function invoke(type, config, handler) {
    win.WeixinJSBridge
      ? WeixinJSBridge.invoke(type, parse(config), function(res) {
          triggerCallbackHandler(type, res, handler);
        })
      : deleteComplete(type, handler);
  }
  function handle(type, handler, config) {
    win.WeixinJSBridge
      ? WeixinJSBridge.on(type, function(e) {
          config && config.trigger && config.trigger(e), triggerCallbackHandler(type, e, handler);
        })
      : config
      ? deleteComplete(type, config)
      : deleteComplete(type, handler);
  }
  function parse(opt) {
    return (
      (opt = opt || {}),
      (opt.appId = globalConfig.appId),
      (opt.verifyAppId = globalConfig.appId),
      (opt.verifySignType = 'sha1'),
      (opt.verifyTimestamp = globalConfig.timestamp + ''),
      (opt.verifyNonceStr = globalConfig.nonceStr),
      (opt.verifySignature = globalConfig.signature),
      opt
    );
  }
  function getSign(e) {
    return {
      timeStamp: e.timestamp + '',
      nonceStr: e.nonceStr,
      package: e.package,
      paySign: e.paySign,
      signType: e.signType || 'SHA1'
    };
  }
  function parseAddress(address) {
    return (
      (address.postalCode = address.addressPostalCode),
      delete address.addressPostalCode,
      (address.provinceName = address.proviceFirstStageName),
      delete address.proviceFirstStageName,
      (address.cityName = address.addressCitySecondStageName),
      delete address.addressCitySecondStageName,
      (address.countryName = address.addressCountiesThirdStageName),
      delete address.addressCountiesThirdStageName,
      (address.detailInfo = address.addressDetailInfo),
      delete address.addressDetailInfo,
      address
    );
  }
  function triggerCallbackHandler(type, res, handler) {
    'openEnterpriseChat' == type && (res.errCode = res.err_code),
      delete res.err_code,
      delete res.err_desc,
      delete res.err_detail;
    var errMsg = res.errMsg;
    errMsg || ((errMsg = res.err_msg), delete res.err_msg, (errMsg = formatErrMsg(type, errMsg)), (res.errMsg = errMsg)),
      (handler = handler || {})._complete && (handler._complete(res), delete handler._complete),
      (errMsg = res.errMsg || ''),
      globalConfig.debug && !handler.isInnerInvoke && alert(JSON.stringify(res));
    var idx = errMsg.indexOf(':');
    switch (errMsg.substring(idx + 1)) {
      case 'ok':
        handler.success && handler.success(res);
        break;
      case 'cancel':
        handler.cancel && handler.cancel(res);
        break;
      default:
        handler.fail && handler.fail(res);
    }
    handler.complete && handler.complete(res);
  }
  function formatErrMsg(type, errMsg) {
    var msgType = type,
      key = reversedEventTypes[msgType];
    key && (msgType = key);
    var msgStatus = 'ok';
    if (errMsg) {
      var r = errMsg.indexOf(':');
      'confirm' == (msgStatus = errMsg.substring(r + 1)) && (msgStatus = 'ok'),
        'failed' == msgStatus && (msgStatus = 'fail'),
        -1 != msgStatus.indexOf('failed_') && (msgStatus = msgStatus.substring(7)),
        -1 != msgStatus.indexOf('fail_') && (msgStatus = msgStatus.substring(5)),
        ('access denied' != (msgStatus = (msgStatus = msgStatus.replace(/_/g, ' ')).toLowerCase()) &&
          'no permission to execute' != msgStatus) ||
          (msgStatus = 'permission denied'),
        'config' == msgType && 'function not exist' == msgStatus && (msgStatus = 'ok'),
        '' == msgStatus && (msgStatus = 'fail');
    }
    return (errMsg = msgType + ':' + msgStatus);
  }
  function transformApiList(apiList) { // onMenuShareTimeline => menu:share:timeline
    if (apiList) {
      for (var i = 0, len = apiList.length; i < len; ++i) {
        var api = apiList[i],
          type = eventTypes[api];
        type && (apiList[i] = type);
      }
      return apiList;
    }
  }
  function deleteComplete(type, handler) {
    if (!(!globalConfig.debug || (handler && handler.isInnerInvoke))) {
      var i = reversedEventTypes[type];
      i && (type = i),
        handler && handler._complete && delete handler._complete,
        console.log('"' + type + '",', handler || '');
    }
  }
  function update(e) {
    if (!(isMac || isWxdebugger || globalConfig.debug || wechatVersion < '6.0.2' || globalInfo.systemType < 0)) {
      var img = new Image();
      (globalInfo.appId = globalConfig.appId),
        (globalInfo.initTime = timeConfig.initEndTime - timeConfig.initStartTime),
        (globalInfo.preVerifyTime = timeConfig.preVerifyEndTime - timeConfig.preVerifyStartTime),
        wx.getNetworkType({
          isInnerInvoke: !0,
          success: function(e) {
            globalInfo.networkType = e.networkType;
            var src =
              'https://open.weixin.qq.com/sdk/report?v=' +
              globalInfo.version +
              '&o=' +
              globalInfo.isPreVerifyOk +
              '&s=' +
              globalInfo.systemType +
              '&c=' +
              globalInfo.clientVersion +
              '&a=' +
              globalInfo.appId +
              '&n=' +
              globalInfo.networkType +
              '&i=' +
              globalInfo.initTime +
              '&p=' +
              globalInfo.preVerifyTime +
              '&u=' +
              globalInfo.url;
            img.src = src;
          }
        });
    }
  }
  function getCurrent() {
    return new Date().getTime();
  }
  function invokeIfWechat(init) {
    isWechat &&
      (win.WeixinJSBridge
        ? init()
        : doc.addEventListener &&
          doc.addEventListener('WeixinJSBridgeReady', fn, !1));
  }
  function initWx() {
    wx.invoke ||
      ((wx.invoke = function(n, i, t) {
        win.WeixinJSBridge && WeixinJSBridge.invoke(n, parse(i), t);
      }),
      (wx.on = function(n, i) {
        win.WeixinJSBridge && WeixinJSBridge.on(n, i);
      }));
  }
  function formatPath(path) {
    if ('string' == typeof path && path.length > 0) {
      var href = path.split('?')[0],
        query = path.split('?')[1];
      return (href += '.html'), void 0 !== query ? href + '?' + query : href;
    }
  }
  if (!win.jWeixin) {
    var eventTypes = {
        config: 'preVerifyJSAPI',
        onMenuShareTimeline: 'menu:share:timeline',
        onMenuShareAppMessage: 'menu:share:appmessage',
        onMenuShareQQ: 'menu:share:qq',
        onMenuShareWeibo: 'menu:share:weiboApp',
        onMenuShareQZone: 'menu:share:QZone',
        previewImage: 'imagePreview',
        getLocation: 'geoLocation',
        openProductSpecificView: 'openProductViewWithPid',
        addCard: 'batchAddCard',
        openCard: 'batchViewCard',
        chooseWXPay: 'getBrandWCPayRequest',
        openEnterpriseRedPacket: 'getRecevieBizHongBaoRequest',
        startSearchBeacons: 'startMonitoringBeacons',
        stopSearchBeacons: 'stopMonitoringBeacons',
        onSearchBeacons: 'onBeaconsInRange',
        consumeAndShareCard: 'consumedShareCard',
        openAddress: 'editAddress'
      },
      reversedEventTypes = (function() {
        var obj = {};
        for (var key in eventTypes) obj[eventTypes[key]] = key;
        return obj;
      })(),
      doc = win.document,
      title = doc.title,
      userAgent = navigator.userAgent.toLowerCase(),
      platform = navigator.platform.toLowerCase(),
      isMac = !(!platform.match('mac') && !platform.match('win')),
      isWxdebugger = -1 != userAgent.indexOf('wxdebugger'),
      isWechat = -1 != userAgent.indexOf('micromessenger'),
      isAndroid = -1 != userAgent.indexOf('android'),
      isIphone = -1 != userAgent.indexOf('iphone') || -1 != userAgent.indexOf('ipad'),
      wechatVersion = (function() {
        var e =
          userAgent.match(/micromessenger\/(\d+\.\d+\.\d+)/) ||
          userAgent.match(/micromessenger\/(\d+\.\d+)/);
        return e ? e[1] : '';
      })(),
      timeConfig = {
        initStartTime: getCurrent(),
        initEndTime: 0,
        preVerifyStartTime: 0,
        preVerifyEndTime: 0
      },
      globalInfo = {
        version: 1,
        appId: '',
        initTime: 0,
        preVerifyTime: 0,
        networkType: '',
        isPreVerifyOk: 1,
        systemType: isIphone ? 1 : isAndroid ? 2 : -1,
        clientVersion: wechatVersion,
        url: encodeURIComponent(location.href)
      },
      globalConfig = {},
      callbacks = { _completes: [] },
      state = { state: 0, data: {} };
    invokeIfWechat(function() {
      timeConfig.initEndTime = getCurrent();
    });
    var O = !1,
      E = [],
      wx = {
        config: function(options) {
          (globalConfig = options), deleteComplete('config', options);
          var check = !1 !== globalConfig.check;
          invokeIfWechat(function() {
            if (check)
              invoke(
                eventTypes.config,
                { verifyJsApiList: transformApiList(globalConfig.jsApiList) },
                (function() {
                  (callbacks._complete = function(e) {
                    (timeConfig.preVerifyEndTime = getCurrent()), (state.state = 1), (state.data = e);
                  }),
                    (callbacks.success = function(e) {
                      globalInfo.isPreVerifyOk = 0;
                    }),
                    (callbacks.fail = function(e) {
                      callbacks._fail ? callbacks._fail(e) : (state.state = -1);
                    });
                  var completes = callbacks._completes;
                  return (
                    completes.push(function() {
                      update();
                    }),
                    (callbacks.complete = function(n) {
                      for (var i = 0, t = completes.length; i < t; ++i) completes[i]();
                      callbacks._completes = [];
                    }),
                    callbacks
                  );
                })()
              ),
                (timeConfig.preVerifyStartTime = getCurrent());
            else {
              state.state = 1;
              for (var e = callbacks._completes, t = 0, o = e.length; t < o; ++t)
                e[t]();
              callbacks._completes = [];
            }
          }),
            initWx();
        },
        ready: function(cb) {
          0 != state.state ? cb() : (callbacks._completes.push(cb), !isWechat && globalConfig.debug && cb());
        },
        error: function(e) {
          wechatVersion < '6.0.2' || (-1 == state.state ? e(state.data) : (callbacks._fail = e));
        },
        checkJsApi: function(e) {
          var n = function(e) {
            var n = e.checkResult;
            for (var i in n) {
              var t = reversedEventTypes[i];
              t && ((n[t] = n[i]), delete n[i]);
            }
            return e;
          };
          invoke(
            'checkJsApi',
            { jsApiList: transformApiList(e.jsApiList) },
            ((e._complete = function(e) {
              if (isAndroid) {
                var i = e.checkResult;
                i && (e.checkResult = JSON.parse(i));
              }
              e = n(e);
            }),
            e)
          );
        },
        onMenuShareTimeline: function(e) {
          handle(
            eventTypes.onMenuShareTimeline,
            {
              complete: function() {
                invoke(
                  'shareTimeline',
                  {
                    title: e.title || title,
                    desc: e.title || title,
                    img_url: e.imgUrl || '',
                    link: e.link || location.href,
                    type: e.type || 'link',
                    data_url: e.dataUrl || ''
                  },
                  e
                );
              }
            },
            e
          );
        },
        onMenuShareAppMessage: function(e) {
          handle(
            eventTypes.onMenuShareAppMessage,
            {
              complete: function(n) {
                'favorite' === n.scene
                  ? invoke('sendAppMessage', {
                      title: e.title || title,
                      desc: e.desc || '',
                      link: e.link || location.href,
                      img_url: e.imgUrl || '',
                      type: e.type || 'link',
                      data_url: e.dataUrl || ''
                    })
                  : invoke(
                      'sendAppMessage',
                      {
                        title: e.title || title,
                        desc: e.desc || '',
                        link: e.link || location.href,
                        img_url: e.imgUrl || '',
                        type: e.type || 'link',
                        data_url: e.dataUrl || ''
                      },
                      e
                    );
              }
            },
            e
          );
        },
        onMenuShareQQ: function(e) {
          handle(
            eventTypes.onMenuShareQQ,
            {
              complete: function() {
                invoke(
                  'shareQQ',
                  {
                    title: e.title || title,
                    desc: e.desc || '',
                    img_url: e.imgUrl || '',
                    link: e.link || location.href
                  },
                  e
                );
              }
            },
            e
          );
        },
        onMenuShareWeibo: function(e) {
          handle(
            eventTypes.onMenuShareWeibo,
            {
              complete: function() {
                invoke(
                  'shareWeiboApp',
                  {
                    title: e.title || title,
                    desc: e.desc || '',
                    img_url: e.imgUrl || '',
                    link: e.link || location.href
                  },
                  e
                );
              }
            },
            e
          );
        },
        onMenuShareQZone: function(e) {
          handle(
            eventTypes.onMenuShareQZone,
            {
              complete: function() {
                invoke(
                  'shareQZone',
                  {
                    title: e.title || title,
                    desc: e.desc || '',
                    img_url: e.imgUrl || '',
                    link: e.link || location.href
                  },
                  e
                );
              }
            },
            e
          );
        },
        updateTimelineShareData: function(e) {
          invoke(
            'updateTimelineShareData',
            { title: e.title, link: e.link, imgUrl: e.imgUrl },
            e
          );
        },
        updateAppMessageShareData: function(options) {
          invoke(
            'updateAppMessageShareData',
            { title: options.title, desc: options.desc, link: options.link, imgUrl: options.imgUrl },
            options
          );
        },
        startRecord: function(e) {
          invoke('startRecord', {}, e);
        },
        stopRecord: function(e) {
          invoke('stopRecord', {}, e);
        },
        onVoiceRecordEnd: function(e) {
          handle('onVoiceRecordEnd', e);
        },
        playVoice: function(e) {
          invoke('playVoice', { localId: e.localId }, e);
        },
        pauseVoice: function(e) {
          invoke('pauseVoice', { localId: e.localId }, e);
        },
        stopVoice: function(e) {
          invoke('stopVoice', { localId: e.localId }, e);
        },
        onVoicePlayEnd: function(e) {
          handle('onVoicePlayEnd', e);
        },
        uploadVoice: function(e) {
          invoke(
            'uploadVoice',
            {
              localId: e.localId,
              isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
            },
            e
          );
        },
        downloadVoice: function(e) {
          invoke(
            'downloadVoice',
            {
              serverId: e.serverId,
              isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
            },
            e
          );
        },
        translateVoice: function(e) {
          invoke(
            'translateVoice',
            {
              localId: e.localId,
              isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
            },
            e
          );
        },
        chooseImage: function(e) {
          invoke(
            'chooseImage',
            {
              scene: '1|2',
              count: e.count || 9,
              sizeType: e.sizeType || ['original', 'compressed'],
              sourceType: e.sourceType || ['album', 'camera']
            },
            ((e._complete = function(e) {
              if (isAndroid) {
                var n = e.localIds;
                try {
                  n && (e.localIds = JSON.parse(n));
                } catch (e) {}
              }
            }),
            e)
          );
        },
        getLocation: function(e) {},
        previewImage: function(e) {
          invoke(eventTypes.previewImage, { current: e.current, urls: e.urls }, e);
        },
        uploadImage: function(e) {
          invoke(
            'uploadImage',
            {
              localId: e.localId,
              isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
            },
            e
          );
        },
        downloadImage: function(e) {
          invoke(
            'downloadImage',
            {
              serverId: e.serverId,
              isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
            },
            e
          );
        },
        getLocalImgData: function(e) {
          !1 === O
            ? ((O = !0),
              invoke(
                'getLocalImgData',
                { localId: e.localId },
                ((e._complete = function(e) {
                  if (((O = !1), E.length > 0)) {
                    var n = E.shift();
                    wx.getLocalImgData(n);
                  }
                }),
                e)
              ))
            : E.push(e);
        },
        getNetworkType: function(e) {
          var n = function(e) {
            var n = e.errMsg;
            e.errMsg = 'getNetworkType:ok';
            var i = e.subtype;
            if ((delete e.subtype, i)) e.networkType = i;
            else {
              var t = n.indexOf(':'),
                o = n.substring(t + 1);
              switch (o) {
                case 'wifi':
                case 'edge':
                case 'wwan':
                  e.networkType = o;
                  break;
                default:
                  e.errMsg = 'getNetworkType:fail';
              }
            }
            return e;
          };
          invoke(
            'getNetworkType',
            {},
            ((e._complete = function(e) {
              e = n(e);
            }),
            e)
          );
        },
        openLocation: function(e) {
          invoke(
            'openLocation',
            {
              latitude: e.latitude,
              longitude: e.longitude,
              name: e.name || '',
              address: e.address || '',
              scale: e.scale || 28,
              infoUrl: e.infoUrl || ''
            },
            e
          );
        },
        getLocation: function(e) {
          (e = e || {}),
            invoke(
              eventTypes.getLocation,
              { type: e.type || 'wgs84' },
              ((e._complete = function(e) {
                delete e.type;
              }),
              e)
            );
        },
        hideOptionMenu: function(e) {
          invoke('hideOptionMenu', {}, e);
        },
        showOptionMenu: function(e) {
          invoke('showOptionMenu', {}, e);
        },
        closeWindow: function(e) {
          invoke('closeWindow', {}, (e = e || {}));
        },
        hideMenuItems: function(e) {
          invoke('hideMenuItems', { menuList: e.menuList }, e);
        },
        showMenuItems: function(e) {
          invoke('showMenuItems', { menuList: e.menuList }, e);
        },
        hideAllNonBaseMenuItem: function(e) {
          invoke('hideAllNonBaseMenuItem', {}, e);
        },
        showAllNonBaseMenuItem: function(e) {
          invoke('showAllNonBaseMenuItem', {}, e);
        },
        scanQRCode: function(e) {
          invoke(
            'scanQRCode',
            {
              needResult: (e = e || {}).needResult || 0,
              scanType: e.scanType || ['qrCode', 'barCode']
            },
            ((e._complete = function(e) {
              if (isIphone) {
                var n = e.resultStr;
                if (n) {
                  var i = JSON.parse(n);
                  e.resultStr = i && i.scan_code && i.scan_code.scan_result;
                }
              }
            }),
            e)
          );
        },
        openAddress: function(e) {
          invoke(
            eventTypes.openAddress,
            {},
            ((e._complete = function(e) {
              e = parseAddress(e);
            }),
            e)
          );
        },
        openProductSpecificView: function(e) {
          invoke(
            eventTypes.openProductSpecificView,
            {
              pid: e.productId,
              view_type: e.viewType || 0,
              ext_info: e.extInfo
            },
            e
          );
        },
        addCard: function(e) {
          for (var n = e.cardList, t = [], o = 0, r = n.length; o < r; ++o) {
            var a = n[o],
              c = { card_id: a.cardId, card_ext: a.cardExt };
            t.push(c);
          }
          invoke(
            eventTypes.addCard,
            { card_list: t },
            ((e._complete = function(e) {
              var n = e.card_list;
              if (n) {
                for (var i = 0, t = (n = JSON.parse(n)).length; i < t; ++i) {
                  var o = n[i];
                  (o.cardId = o.card_id),
                    (o.cardExt = o.card_ext),
                    (o.isSuccess = !!o.is_succ),
                    delete o.card_id,
                    delete o.card_ext,
                    delete o.is_succ;
                }
                (e.cardList = n), delete e.card_list;
              }
            }),
            e)
          );
        },
        chooseCard: function(e) {
          invoke(
            'chooseCard',
            {
              app_id: globalConfig.appId,
              location_id: e.shopId || '',
              sign_type: e.signType || 'SHA1',
              card_id: e.cardId || '',
              card_type: e.cardType || '',
              card_sign: e.cardSign,
              time_stamp: e.timestamp + '',
              nonce_str: e.nonceStr
            },
            ((e._complete = function(e) {
              (e.cardList = e.choose_card_info), delete e.choose_card_info;
            }),
            e)
          );
        },
        openCard: function(e) {
          for (var n = e.cardList, t = [], o = 0, r = n.length; o < r; ++o) {
            var a = n[o],
              c = { card_id: a.cardId, code: a.code };
            t.push(c);
          }
          invoke(eventTypes.openCard, { card_list: t }, e);
        },
        consumeAndShareCard: function(e) {
          invoke(
            eventTypes.consumeAndShareCard,
            { consumedCardId: e.cardId, consumedCode: e.code },
            e
          );
        },
        chooseWXPay: function(e) {
          invoke(eventTypes.chooseWXPay, getSign(e), e);
        },
        openEnterpriseRedPacket: function(e) {
          invoke(eventTypes.openEnterpriseRedPacket, getSign(e), e);
        },
        startSearchBeacons: function(e) {
          invoke(eventTypes.startSearchBeacons, { ticket: e.ticket }, e);
        },
        stopSearchBeacons: function(e) {
          invoke(eventTypes.stopSearchBeacons, {}, e);
        },
        onSearchBeacons: function(e) {
          handle(eventTypes.onSearchBeacons, e);
        },
        openEnterpriseChat: function(e) {
          invoke(
            'openEnterpriseChat',
            { useridlist: e.userIds, chatname: e.groupName },
            e
          );
        },
        launchMiniProgram: function(e) {
          invoke(
            'launchMiniProgram',
            {
              targetAppId: e.targetAppId,
              path: formatPath(e.path),
              envVersion: e.envVersion
            },
            e
          );
        },
        miniProgram: {
          navigateBack: function(e) {
            (e = e || {}),
              invokeIfWechat(function() {
                invoke(
                  'invokeMiniProgramAPI',
                  { name: 'navigateBack', arg: { delta: e.delta || 1 } },
                  e
                );
              });
          },
          navigateTo: function(e) {
            invokeIfWechat(function() {
              invoke(
                'invokeMiniProgramAPI',
                { name: 'navigateTo', arg: { url: e.url } },
                e
              );
            });
          },
          redirectTo: function(e) {
            invokeIfWechat(function() {
              invoke(
                'invokeMiniProgramAPI',
                { name: 'redirectTo', arg: { url: e.url } },
                e
              );
            });
          },
          switchTab: function(e) {
            invokeIfWechat(function() {
              invoke(
                'invokeMiniProgramAPI',
                { name: 'switchTab', arg: { url: e.url } },
                e
              );
            });
          },
          reLaunch: function(e) {
            invokeIfWechat(function() {
              invoke(
                'invokeMiniProgramAPI',
                { name: 'reLaunch', arg: { url: e.url } },
                e
              );
            });
          },
          postMessage: function(e) {
            invokeIfWechat(function() {
              invoke(
                'invokeMiniProgramAPI',
                { name: 'postMessage', arg: e.data || {} },
                e
              );
            });
          },
          getEnv: function(n) {
            invokeIfWechat(function() {
              n({ miniprogram: 'miniprogram' === win.__wxjs_environment });
            });
          }
        }
      },
      b = 1,
      R = {};
    return (
      doc.addEventListener(
        'error',
        function(e) {
          if (!isAndroid) {
            var n = e.target,
              i = n.tagName,
              t = n.src;
            if (
              ('IMG' == i || 'VIDEO' == i || 'AUDIO' == i || 'SOURCE' == i) &&
              -1 != t.indexOf('wxlocalresource://')
            ) {
              e.preventDefault(), e.stopPropagation();
              var o = n['wx-id'];
              if ((o || ((o = b++), (n['wx-id'] = o)), R[o])) return;
              (R[o] = !0),
                wx.ready(function() {
                  wx.getLocalImgData({
                    localId: t,
                    success: function(e) {
                      n.src = e.localData;
                    }
                  });
                });
            }
          }
        },
        !0
      ),
      doc.addEventListener(
        'load',
        function(e) {
          if (!isAndroid) {
            var n = e.target,
              i = n.tagName;
            n.src;
            if ('IMG' == i || 'VIDEO' == i || 'AUDIO' == i || 'SOURCE' == i) {
              var t = n['wx-id'];
              t && (R[t] = !1);
            }
          }
        },
        !0
      ),
      noGlobal && (win.wx = win.jWeixin = wx),
      wx
    );
  }
});
