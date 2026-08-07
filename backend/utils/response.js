export const ok = (res, msg, status = 200) => res.status(status).json({ ok: true, msg });
export const fail = (res, msg, status = 400) => res.status(status).json({ ok: false, msg });
