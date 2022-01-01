/**
 * A class with static methods to simplify the use of cryptographic functions throughout the application.
 */
class CryptoFD {
	/**
	 * @param {ArrayBuffer} data - The file data as an ArrayBuffer.
	 * @returns {string} - An encoded string version of the file data.
	 */
	static encode(data) {
		return String.fromCharCode.apply(null, new Uint8Array(data));
	}

	/**
	 * @param {string} plaintext - The string to encrypt.
	 * @param {string} password - The encryption password.
	 * @returns {string} - The ciphertext.
	 */
	static encryptAES(plaintext, password) {
		let encrypted = CryptoJS.AES.encrypt(plaintext, password, { 
			mode: CryptoJS.mode.CFB,
			padding: CryptoJS.pad.Pkcs7
		});

		return encrypted.toString();
	}

	/**
	 * @param {string} ciphertext - The string to decrypt.
	 * @param {string} password - The decryption password.
	 * @returns {string} - The plaintext.
	 */
	static decryptAES(ciphertext, password) {
		let decrypted = CryptoJS.AES.decrypt(ciphertext, password, {
			mode: CryptoJS.mode.CFB,
			padding: CryptoJS.pad.Pkcs7
		});

		return decrypted.toString(CryptoJS.enc.Utf8);
	}

	/**
	 * @param {string} plaintext - The string to encrypt.
	 * @param {string} publicKey - The public RSA key to encrypt the data with.
	 * @returns {string} - A Base64 encoded version of the ciphertext.
	 */
	static encryptRSA(plaintext, publicKey) {
		return new Promise((resolve) => {
			publicKey = forge.pki.publicKeyFromPem(publicKey);
			resolve(btoa(publicKey.encrypt(plaintext, "RSA-OAEP")));
		});
	}

	/**
	 * @param {string} ciphertext - The string to decrypt.
	 * @param {string} privateKey - The private RSA key to decrypt the data with.
	 * @returns {string} - The plaintext.
	 */
	static decryptRSA(ciphertext, privateKey) {
		return new Promise((resolve) => {
			privateKey = forge.pki.privateKeyFromPem(privateKey);
			resolve(privateKey.decrypt(atob(ciphertext), "RSA-OAEP"));
		});
	}

	/**
	 * Generates a random password, and a cryptographically random salt, from which a 256-bit AES key is derived.
	 * @returns {string} - The AES key.
	 */
	static generateAESKey() {
		let result = "";
		let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let charactersLength = characters.length;

		for(let i = 0; i < charactersLength; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		let salt = CryptoJS.lib.WordArray.random(128/8);

		return CryptoJS.PBKDF2(result, salt, { keySize: 256/32 }).toString(CryptoJS.enc.Base64);
	}

	/**
	 * Generate a public and private RSA key pair.
	 * @returns {Object} - An object containing both the public and private key.
	 */
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