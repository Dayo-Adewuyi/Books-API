
export default {

    createBook: `
        INSERT INTO books (
            title, 
            authors, 
            publisher, 
            published, 
            genre, 
            summary, 
            cover_image,
            price
        ) VALUES (
            $(title), 
            $(authors), 
            $(publisher), 
            $(published), 
            $(genre), 
            $(summary), 
            $(cover_image),
            $(price)
        ) RETURNING book_id;
    `,


    getAllBooks: `
        SELECT *
        FROM books
        ORDER BY created_at DESC;
    `,

    getBookById: `
        SELECT *
        FROM books
        WHERE book_id = $1;
    `,






    updateBook: `
        UPDATE books 
        SET 
            title = $(title),
            authors = $(authors),
            publisher = $(publisher),
            published = $(published),
            genre = $(genre),
            summary = $(summary),
            cover_image = $(cover_image),
            updated_at = NOW()
        WHERE book_id = $(bookId)
        RETURNING book_id, title, authors, publisher, published, genre, summary, cover_image, updated_at;
    `,


    deleteBook: `
        DELETE FROM books 
        WHERE book_id = $1
        RETURNING book_id;
    `,

    getUserPurchases: `
        SELECT 
            p.id,
            p.payment_reference,
            p.status,
            p.purchase_date,
            p.quantity,
            p.total_price,
            b.title AS book_title,
            u.username AS user_name
        FROM 
            purchases p
        JOIN 
            books b ON p.book_id = b.book_id
        JOIN 
            users u ON p.user_id = u.id
        WHERE 
            p.user_id = $1;
`,
    createPurchase: `
        INSERT INTO purchases (
            payment_reference,
            user_id,
            book_id,
            quantity,
            total_price
        ) VALUES (
            $(payment_reference),
            $(user_id),
            $(book_id),
            $(quantity),
            $(total_price)
        ) RETURNING id;
        `,
};
