import fs from "fs";

export default function()
{
	//fs.writeFileSync('test', 'test1234');
	fs.existsSync('test');
}

// Storage = require(../core/storage.js)
// Storage.read(header)
// Storage.write(header)