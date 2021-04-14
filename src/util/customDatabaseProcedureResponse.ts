import { Response } from 'express';

export default function customDatabaseProcedureResponse(res: Response, rows: any, success: any) {
	const result = rows[0][0].result;

	const [statusCode, message] = result.split(':');

	switch (statusCode) {
		case 'ERR':
			return res.status(400).json({ message });
		case 'SUC':
			return res.status(200).json({ message, object: { ...success } });
		default:
			return res.status(200).json({ message });
	}
}
