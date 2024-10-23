export default {
    createUser: `
        INSERT INTO 
            users(username, password)
        VALUES 
            ($(username), $(password))
        RETURNING id;
    `,

    getUser: `
        SELECT
            users.id,
            username,
            password
        FROM
            users
        LEFT JOIN purchases ON purchases.user_id = users.id
        WHERE
            (users.id::text = $1 OR username = $1);
    `,
};
