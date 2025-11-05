import "./App.css";

function Book({ title, author, image, loan, selected, onSelect }) {
  const isLoaned = Boolean(loan);

  return (
    <div
      className={`card-book ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="card-book-image">
        {/* แสดง badge มุมขวาบน */}
        {isLoaned && <div className="book-loan-badge">On loan</div>}

        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="img-placeholder">No image</div>
        )}
      </div>

      <div className="card-book-body">
        <h3 className="book-title">{title}</h3>
        <p className="book-author">by {author}</p>
      </div>
    </div>
  );
}

export default Book;
