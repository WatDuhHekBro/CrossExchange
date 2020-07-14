export interface Config
{
	token: string;
	prefix: string;
	admins: string[];
}

/*const storage = {
	"users": {},
	"guilds": {}
};

const stonks = {
	"markets": {},
	"events": []
};*/

export function applyTemplate(data: object, header: string)
{
	return data;
}