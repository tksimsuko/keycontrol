/**
 * keycontrol.js
 * version  2.0.0
 * Copyright 2022 tksimsuko.
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
*/

if(module && module.exports){
	module.exports = keycontrol;
}

function keycontrol(){
	// key code propertie
	const keyCodeProp = {
		"backspace":8, "enter":13, "capslock":20, "esc":27, "space":32, "pageup":33, "pagedown":34, "end":35, "home":36, "left":37, "up":38, "right":39, "down":40, "printscreen":44, "insert":45, "delete":46, 
		"0":48, "1":49, "2":50, "3":51, "4":52, "5":53, "6":54, "7":55, "8":56, "9":57, 
		"a":65, "b":66, "c":67, "d":68, "e":69, "f":70, "g":71, "h":72, "i":73, "j":74, "k":75, "l":76, "m":77, "n":78, "o":79, "p":80, "q":81, "r":82, "s":83, "t":84, "u":85, "v":86, "w":87, "x":88, "y":89, "z":90, 
		"F1":112, "F2":113, "F3":114, "F4":115, "F5":116, "F6":117, "F7":118, "F8":119, "F9":120, "F10":121, "F11":122, "F12":123, 
		"numlock":144, "scrolllock":145, ",":188, ".":190
	};
	// key name propertie
	const keyNameProp = {
		8:"backspace", 13:"enter", 20:"capslock", 27:"esc", 32:"space", 33:"pageup", 34:"pagedown", 35:"end", 36:"home", 37:"left", 38:"up", 39:"right", 40:"down", 44:"printscreen", 45:"insert", 46:"delete", 
		48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 
		65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z", 
		96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7", 104:"8", 105:"9", 
		112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 
		144:"numlock", 145:"scrolllock" ,188:",", 190:"."
	};
	// meta key propertie
	const metaKeysProp = {
		alt: "alt",
		ctrl: "ctrl",
		command: "command",
		shift: "shift",
		CmdOrCtrl: 'cmdorctrl'
	};

	///// initialize
	switch(arguments.length){
		case 1:
			const param = arguments[0];
			if(!param || typeof(param) !== 'object'){
				throw new Error('keycontrol / parameter not found.');
			}

			///// 宣言呼び出し
			return apply(param);
		case 2:
			///// input要素 キー入力表示イベント
			inputTyped(arguments[0], arguments[1]);
			break;
		case 3:
			///// bind 省略呼び出し
			return bind(window, 'keydown', arguments[0], arguments[1], arguments[2]);
		case 5:
			///// bind 呼び出し
			return bind(getTarget(arguments[0]), arguments[1], arguments[2], arguments[3], arguments[4]);
		default:
			throw new Error('keycontrol / parameter is invalid.');
	}

	///// function
	/**
	 * bind key control declarative
	 * @param param 
	 * {
	 *    'bind name': {
	 * 	    // target  option / default: window
	 * 	    // type  option / default: keydown
	 * 	    // meta  option
	 * 	    // key  required
	 * 	    // callback  required
	 *    },
	 *    ¨
	 * }  
	 */
	function apply(param){
		let keyEvent = param;

		///// initialize
		for(let bindName in keyEvent){
			let keyEventValue = keyEvent[bindName];
			let target = window;
			if(keyEventValue.target){
				target = getTarget(keyEventValue.target);
			}
			keyEventValue.target = target;

			let type = 'keydown';
			if(keyEventValue.type){
				type = keyEventValue.type;
			}
			keyEventValue.type = type

			let meta = [];
			if(keyEventValue.meta){
				meta = keyEventValue.meta;
			}
			keyEventValue.meta = meta;

			let key = keyEventValue.key;
			let callback = keyEventValue.callback;
			keyEventValue.control = bind(target, type, meta, key, callback);
		}

		return {
			on: on,
			off: off,
			reset: reset,
			onAll: onAll,
			offAll: offAll,
			get: get,
			getKeyEvent: getKeyEvent
		};

		function on(bindName){
			if(!bindName){
				throw new Error('keycontrol on / bindName is not found.');
			}
			let keyEventValue = keyEvent[bindName];
			if(keyEventValue){
				keyEventValue.control.on();
			}
		}
		function off(bindName){
			if(!bindName){
				throw new Error('keycontrol off / bindName is not found.');
			}
			let keyEventValue = keyEvent[bindName];
			if(keyEventValue){
				keyEventValue.control.off();
			}
		}
		function onAll(){
			for(let bindName in keyEvent){
				let keyEventValue = keyEvent[bindName];
				keyEventValue.control.on();
			}
		}
		function offAll(){
			for(let bindName in keyEvent){
				let keyEventValue = keyEvent[bindName];
				keyEventValue.control.off();
			}
		}
		function reset(bindName, resetParam){
			let keyEventValue = keyEvent[bindName];
			if(keyEventValue){
				keyEventValue.control.reset(resetParam);
			}
		}
		function get(bindName){
			return keyEvent[bindName];
		}
		function getKeyEvent(){
			return keyEvent;
		}
	}

	/**
	 * bind key control event
	 * @param target bind event target (window / selector string)
	 * @param type event type (keydown, keyup, keypress)
	 * @param meta: [alt ctrl command shift CmdOrCtrl] string array // CmdOrCtrl (Mac -> command / windows -> ctrl)
	 * @param key: key String
	 * @param callback 
	*/
	function bind(target, type, meta, key, callback){
		// metaKey
		if(typeof(meta) === 'string'){
			meta = [meta];
		}
		let metaKeys = getMetaKeyProp(meta);
		
		// named function
		let namedCallback = generateNamedFunction();

		// バインド
		on();

		return {
			on: on,
			off: off,
			reset: reset,
			get: get
		};

		function on(){
			target.addEventListener(type, namedCallback);
		}
		function off(){
			target.removeEventListener(type, namedCallback);
		}
		function reset(resetParam){
			if(!resetParam || typeof(resetParam) !== 'object'){
				throw new Error('keycontrol reset / parameter is not object type.');
			}

			// before event off
			off();

			let resetTarget = target;
			let resetType = type;
			let resetMeta = meta;
			let resetKey = key;
			let resetCallback = callback;
			if(resetParam.target){
				resetTarget = getTarget(resetParam.target);
			}
			if(resetParam.type){
				resetType = resetParam.type;
			}
			if(resetParam.meta){
				resetMeta = resetParam.meta;
			}
			if(resetParam.key){
				resetKey = resetParam.key;
			}
			if(resetParam.callback){
				resetCallback = resetParam.callback;
			}
			// bind event
			return bind(resetTarget, resetType, resetMeta, resetKey, resetCallback);
		}
		
		function get(){
			return {
				target: target,
				type: type,
				meta: meta,
				key: key,
				callback: callback
			};
		}

		function eventCallback(event){
			let keyCode = keyCodeProp[key];
			if(isKeyPressed(event, metaKeys, keyCode)){
				return callback(event);
			}
		}

		function generateNamedFunction(){
			let functionName = 'keycontrol' + Date.now();
			let functionStr = 'return function ' + functionName + '(event){ return eventCallback(event); };';
			return new Function('eventCallback', functionStr)(eventCallback);
		}

		function getMetaKeyProp(metaKeys){
			let metaKeyProp = {
				alt: false,
				ctrl: false,
				command: false,
				shift: false
			};

			if(typeof(metaKeys) === 'string'){
				let metakeysString = metaKeys.toLowerCase();
				metaKeys = metakeysString.split('+');
			}

			//metakeys : array
			for(let i in metaKeys){
				let metaKey = metaKeys[i].toLowerCase();

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

		// key event　判定
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
			let keyCode = event.keyCode;
			if(targetKeyCode && (targetKeyCode !== keyCode)) return false;
			return true;
		}
	}

	function getTarget(paramTarget){
		let target;
		if(paramTarget === window){
			target = paramTarget;
		}else if(paramTarget.nodeName){
			target = paramTarget;
		}else if(typeof(paramTarget) === 'string'){
			target = document.querySelector(paramTarget);
		}else{
			// default target
			target = window;
		}
		return target;
	}

	function inputTyped(target, onTyped){	
		////////// initialize
		let inputElement;
		if(target.nodeName){
			inputElement = target;
		}else{
			inputElement = document.querySelector(target);
		}
		
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
	
		////////// function
		// input要素にタイプしたコマンドを取得する
		function getKeyCommandFromInputEvent(event){
			let which = event.which;
			let keys = [];
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
			
			let keyValue = keyNameProp[which] || "";
			
			return {
				meta: keys,
				key: keyValue
			};
		}
		// input要素にタイプしたコマンドをinputに表示する
		function showKeyCommandToInputText(event){
			let cmd = getKeyCommandFromInputEvent(event);
			event.target.value = generateCommandString(cmd);
	
			event.preventDefault();
			return false;
		}
		function generateCommandString(cmd){
			if(!cmd){
				return "";
			}
			if(cmd.meta && cmd.meta.length > 0){
				let metaKey = cmd.meta.join(" + ");
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
			let cmd = {
				meta: [],
				key: ''
			};
	
			let vals = str.split(" + ");
			let len = vals.length;
			for(let i=0; i<len; i++){
				let val = vals[i];
				if(metaKeysProp[val]){
					cmd.meta.push(val);
				}else{
					cmd.key = val;
				}
			}
	
			return cmd;
		}
	}
};
