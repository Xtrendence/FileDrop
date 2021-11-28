class CryptoFD {
	static encode(data) {
		return String.fromCharCode.apply(null, new Uint8Array(data));
	}

	static encryptAES(plaintext, password) {
		let encrypted = CryptoJS.AES.encrypt(plaintext, password, { 
			mode: CryptoJS.mode.CFB,
			padding: CryptoJS.pad.Pkcs7
		});

		return encrypted.toString();
	}

	static decryptAES(ciphertext, password) {
		let decrypted = CryptoJS.AES.decrypt(ciphertext, password, {
			mode: CryptoJS.mode.CFB,
			padding: CryptoJS.pad.Pkcs7
		});

		return decrypted.toString(CryptoJS.enc.Utf8);
	}

	static encryptRSA(plaintext, publicKey) {
		return new Promise((resolve) => {
			publicKey = forge.pki.publicKeyFromPem(publicKey);
			resolve(btoa(publicKey.encrypt(plaintext, "RSA-OAEP")));
		});
	}

	static decryptRSA(ciphertext, privateKey) {
		return new Promise((resolve) => {
			privateKey = forge.pki.privateKeyFromPem(privateKey);
			resolve(privateKey.decrypt(atob(ciphertext), "RSA-OAEP"));
		});
	}

	static generateAESKey() {
		let result = "";
		let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let charactersLength = characters.length;

		for(let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		let salt = CryptoJS.lib.WordArray.random(128/8);

		return CryptoJS.PBKDF2(result, salt, { keySize: 256/32 }).toString(CryptoJS.enc.Base64);
	}

	static generateRSAKeys() {
		let rsa = forge.pki.rsa;

		return new Promise((resolve, reject) => {
			rsa.generateKeyPair({ bits:2048, workers:-1 }, (error, keys) => {
				if(error) {
					reject(error);
				} else {
					resolve({ publicKey:forge.pki.publicKeyToPem(keys.publicKey), privateKey:forge.pki.privateKeyToPem(keys.privateKey) });
				}
			});
		});
	}
}