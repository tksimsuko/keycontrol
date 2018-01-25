/**
 * keycontrol.js
 * 
 * version  1.7.1
 *
 * Copyright 2016 tksimsuko.
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * bind function
 * @param target bind event target (window / key event dom)
 * @param type event type (keydown, keyup, keypress …)
 * @param metaKeySet: [alt ctrl command shift] array / CmdOrCtrl string (Mac -> command / windows -> ctrl)
 * @param key: key String
 * @param callback 
*/
function KeyControl(){
	//key code propertie
	var keyCodeProp = {
		"backspace":8, "enter":13, "capslock":20, "esc":27, "space":32, "pageup":33, "pagedown":34, "end":35, "home":36, "left":37, "up":38, "right":39, "down":40, "printscreen":44, "insert":45, "delete":46, 
		"0":48, "1":49, "2":50, "3":51, "4":52, "5":53, "6":54, "7":55, "8":56, "9":57, 
		"a":65, "b":66, "c":67, "d":68, "e":69, "f":70, "g":71, "h":72, "i":73, "j":74, "k":75, "l":76, "m":77, "n":78, "o":79, "p":80, "q":81, "r":82, "s":83, "t":84, "u":85, "v":86, "w":87, "x":88, "y":89, "z":90, 
		"F1":112, "F2":113, "F3":114, "F4":115, "F5":116, "F6":117, "F7":118, "F8":119, "F9":120, "F10":121, "F11":122, "F12":123, 
		"numlock":144, "scrolllock":145, ",":188, ".":190
	};
	//key name propertie
	var keyNameProp = {
		8:"backspace", 13:"enter", 20:"capslock", 27:"esc", 32:"space", 33:"pageup", 34:"pagedown", 35:"end", 36:"home", 37:"left", 38:"up", 39:"right", 40:"down", 44:"printscreen", 45:"insert", 46:"delete", 
		48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
		65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 
		96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7", 104:"8", 105:"9", 
		112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 
		144:"numlock", 145:"scrolllock" ,188:",", 190:"."
	};
	//meta key
	var metaKeysProp = {
		alt: "alt",
		ctrl: "ctrl",
		command: "command",
		shift: "shift",
		CmdOrCtrl: 'cmdorctrl'
	};

	//登録したイベント
	var events = {};

	return {
		on: bindWindowKeyDown,
		bind: bind,
		isName: isName,
		containsName: containsName,
		getKeyCommandFromInputEvent: getKeyCommandFromInputEvent,
		showKeyCommandToInputText: showKeyCommandToInputText,
		bindShowTypedKey: bindShowTypedKey,
		generateCommandString: generateCommandString,
		generateCommand: generateCommand
	};

	///// function
	function bind(target, type, metaKeySet, key, callback){
		var kcTarget = target || window;
		var kcType = type || "keydown";
		// metaKey
		var metaKeyProp = getMetaKeyProp(metaKeySet);
		// key
		var kcKey = key;

		// callback
		var kcCallback = callback;

		//validate
		if((!metaKeySet || metaKeySet.length === 0) && !key){
			console.error("keycontrol is not binded. key is not setting.");
			return;
		}
		// バインド
		on();

		return {
			on: on,
			off: off,
			resetKey: function(rbMetaKeyProp, rbKey){
				if(rbMetaKeyProp) metaKeyProp = getMetaKeyProp(rbMetaKeyProp);
				if(rbKey) kcKey = rbKey;
			},
			rebind: function(rbType, rbMetaKeyProp, rbKey, cb){
				// 初期化
				kcType = rbType;
				if(rbMetaKeyProp) metaKeyProp = getMetaKeyProp(rbMetaKeyProp);
				if(rbKey) kcKey = rbKey;
				if(cb) kcCallback = cb;
				off();
				on();
			}
		};
		function keyBind(event){
			var keyCode = keyCodeProp[kcKey];
			if(isKeyPressed(event, metaKeyProp, keyCode)) return kcCallback(event);
		}

		function on(){
			if(kcTarget.addEventListener){
				kcTarget.addEventListener(kcType, keyBind, false);
			}else if(kcTarget.attachEvent){
				kcTarget.attachEvent("on" + kcType, keyBind);
			}
		}
		function off(){
			if(kcTarget.removeEventListener){
				kcTarget.removeEventListener(kcType, keyBind, false);
			}else if(kcTarget.attachEvent){
				kcTarget.detachEvent("on" + kcType, keyBind);
			}
		}
		function getMetaKeyProp(metaKeys){
			var metaKeyProp = {
				alt: false,
				ctrl: false,
				command: false,
				shift: false
			};

			if(typeof(metaKeys) === 'string'){
				var metakeysString = metaKeys.toLowerCase();
				metaKeys = metakeysString.split('+');
			}

			//metakeys : array
			for(var i in metaKeys){
				var metaKey = metaKeys[i].toLowerCase();

				//metaKeys : CommandOrControl
				if(metaKey === metaKeysProp.CmdOrCtrl){
					if(window.navigator.userAgent.match(/Mac/)){
						metaKeyProp.command = true;
					}else{
						metaKeyProp.ctrl = true;
					}
				}

				//metakeys  other
				metaKeyProp[metaKey] = true;
			}
			
			return metaKeyProp;
		}

		function isKeyPressed(event, targetMetaKey, targetKey){
			return isMetaKey(event, targetMetaKey) && isKey(event, targetKey);
		}

		// meta key 判定
		// metaProp の状態と完全一致 判定
		// @param event: keyDown event
		// @param targetMetaKey: 対象となるメタキー 必須 以下すべて必須
		//		alt
		//		command
		//		ctrl
		//		shift
		function isMetaKey(event, targetMetaKey){
			if(targetMetaKey.alt !== event.altKey) return false;
			if(targetMetaKey.ctrl !== event.ctrlKey) return false;
			if(targetMetaKey.shift !== event.shiftKey) return false;
			if(targetMetaKey.command !== event.metaKey) return false;
			return true;
		}
		// key 判定
		// @param event: keyDown event
		// @param targetKeyCode  keyCode
		function isKey(event, targetKeyCode){
			var keyCode = event.keyCode;
			if(targetKeyCode && (targetKeyCode !== keyCode)) return false;
			return true;
		}
	}
	function bindWindowKeyDown(metaKeySet, key, callback){
		if(arguments.length === 2){
			callback = key;

			let keyList = metaKeySet.split('+');
			if(keyList.length > 1){
				metaKeySet = keyList.splice(0, keyList.length - 1);
				key = keyList.splice(keyList.length - 1);
			}else{
				key = metaKeySet
				metaKeySet = null;
			}
		}

		return bind(window, 'keydown', metaKeySet, key, callback);
	}

	// key　code 判定
	function isName(event, keyName){
		return event.keyCode === keyCodeProp[keyName];
	}
	function containsName(event, keyNames){
		var len = keyNames.length;
		for(var i=0; i<len; i++){
			var keyName = keyNames[i];
			if(isName(event, keyName)){
				return true;
			}
		}
		return false;
	}
	
	// input要素に タイプしたコマンドを表示するイベント をバインドする
	function bindShowTypedKey(inputSelector, onTyped){
		var inputElement = document.querySelector(inputSelector);
		inputElement.addEventListener('keydown', function(event){
			//エラーハンドリング
			let checkCmd = getKeyCommandFromInputEvent(event);
			if(!checkCmd.key){
				showKeyCommandToInputText(event);
				return;
			}

			//inputに入力したキーを表示
			showKeyCommandToInputText(event);

			let cmd = generateCommand(event.target.value);
			if(onTyped){
				onTyped(cmd);
			}

			event.preventDefault();
			event.stopPropagation();
		});
	}
	// input要素にタイプしたコマンドを取得する
	function getKeyCommandFromInputEvent(event){
		var which = event.which;
		var keys = [];
		if(event.altKey){
			keys.push(metaKeysProp.alt);
		}
		if(event.ctrlKey){
			keys.push(metaKeysProp.ctrl);
		}
		if(event.metaKey){
			keys.push(metaKeysProp.command);
		}
		if(event.shiftKey){
			keys.push(metaKeysProp.shift);
		}
		
		var keyValue = keyNameProp[which] || "";
		
		return {
			meta: keys,
			key: keyValue
		};
	}
	// input要素にタイプしたコマンドをinputに表示する
	function showKeyCommandToInputText(event){
		var cmd = getKeyCommandFromInputEvent(event);
		event.target.value = generateCommandString(cmd);

		event.preventDefault();
		return false;
	}
	function generateCommandString(cmd){
		if(!cmd){
			return "";
		}
		if(cmd.meta && cmd.meta.length > 0){
			var metaKey = cmd.meta.join(" + ");
			if(metaKey){
				if(!cmd.key){
					return metaKey;
				}

				return metaKey + " + " + cmd.key;
			}
		}

		return cmd.key || "";
	}
	function generateCommand(str){
		var cmd = {
			meta: [],
			key: ''
		};

		var vals = str.split(" + ");
		var len = vals.length;
		for(var i=0; i<len; i++){
			var val = vals[i];
			if(metaKeysProp[val]){
				cmd.meta.push(val);
			}else{
				cmd.key = val;
			}
		}

		return cmd;
	}
}