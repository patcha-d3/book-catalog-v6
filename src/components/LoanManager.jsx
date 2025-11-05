import { useEffect, useMemo, useState } from "react";

/**
 * โหมด:
 * - mode="panel": แผงฝั่งซ้าย (ใช้ selectedBook, onSaveLoan, onReturnLoan, onOpenPage)
 * - mode="page" : หน้าเต็ม (ใช้ books, onLoan, onReturn, onBack)
 */
export default function LoanManager(props) {
  const {
    mode = "panel",
    // panel
    selectedBook,
    onSaveLoan,
    onReturnLoan,
    onOpenPage,
    // page
    books,
    onLoan,
    onReturn,
    onBack,
  } = props;

  if (mode === "page") {
    return (
      <LoanManagerPage
        books={books}
        onLoan={onLoan}
        onReturn={onReturn}
        onBack={onBack}
      />
    );
  }
  return (
    <LoanManagerPanel
      selectedBook={selectedBook}
      onSaveLoan={onSaveLoan}
      onReturnLoan={onReturnLoan}
      onOpenPage={onOpenPage}
    />
  );
}

/* -------------------- โหมด panel -------------------- */
function LoanManagerPanel({
  selectedBook,
  onSaveLoan,
  onReturnLoan,
  onOpenPage,
}) {
  const [borrower, setBorrower] = useState("");
  const [weeks, setWeeks] = useState(1);

  useEffect(() => {
    if (selectedBook?.loan) {
      setBorrower(selectedBook.loan.borrower || "");
      setWeeks(selectedBook.loan.weeks || 1);
    } else {
      setBorrower("");
      setWeeks(1);
    }
  }, [selectedBook]);

  if (!selectedBook) {
    return (
      <div className="loan-panel">
        <h3 className="loan-title">Loan Management</h3>
        <p className="muted">Select a book to manage its loan.</p>
      </div>
    );
  }

  const isUserAdded = Boolean(selectedBook.isUserAdded);

  // ถ้าเป็นหนังสือที่ผู้ใช้เพิ่มเอง: ไม่ให้จัดการยืมจาก panel
  if (isUserAdded) {
    return (
      <div className="loan-panel">
        <h3 className="loan-title">Loan Management</h3>
        <div className="loan-meta">
          <div className="small">
            <strong>{selectedBook.title}</strong> by{" "}
            {selectedBook.author || "—"}
          </div>
          <div className="muted small">
            This book was added by you. Manage its loan on the Loans page.
          </div>
        </div>
        <div className="loan-actions">
          <button
            type="button"
            className="button-update"
            onClick={() => onOpenPage?.()}
          >
            Open Manage Loans
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (e) => {
    e.preventDefault();
    if (!borrower.trim()) return;
    onSaveLoan?.({
      isbn13: selectedBook.isbn13,
      borrower: borrower.trim(),
      weeks: Number(weeks) || 1,
    });
  };

  const handleReturn = () => {
    onReturnLoan?.(selectedBook.isbn13);
    setBorrower("");
    setWeeks(1);
  };

  const isLoaned = Boolean(selectedBook.loan);
  const due =
    isLoaned && selectedBook.loan.dueDate
      ? new Date(selectedBook.loan.dueDate).toLocaleDateString()
      : null;

  return (
    <div className="loan-panel">
      <h3 className="loan-title">Loan Management</h3>

      <div className="loan-meta">
        <div className="muted small">Selected:</div>
        <div className="small">
          <strong>{selectedBook.title}</strong> by {selectedBook.author || "—"}
        </div>
        {isLoaned && (
          <div className="small">
            <span className="muted">Status:</span> Borrowed by{" "}
            <strong>{selectedBook.loan.borrower}</strong>
            {due ? ` (due ${due})` : ""}
          </div>
        )}
      </div>

      <form className="loan-form" onSubmit={handleSave}>
        <label className="loan-label">
          Borrower
          <input
            type="text"
            placeholder="Name"
            value={borrower}
            onChange={(e) => setBorrower(e.target.value)}
          />
        </label>

        <label className="loan-label">
          Period (weeks)
          <input
            type="number"
            min={1}
            max={4}
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
          />
        </label>

        <div className="loan-actions">
          <button className="button-primary" type="submit">
            Save
          </button>
          <button
            className="button-ghost"
            type="button"
            onClick={handleReturn}
            disabled={!isLoaned}
            title={!isLoaned ? "This book is not borrowed" : ""}
          >
            Return
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------- โหมด page -------------------- */
function LoanManagerPage({ books = [], onLoan, onReturn, onBack }) {
  const availableBooks = useMemo(() => books.filter((b) => !b.loan), [books]);
  const loanedBooks = useMemo(() => books.filter((b) => b.loan), [books]);

  const [borrower, setBorrower] = useState("");
  const [isbn13, setIsbn13] = useState(availableBooks[0]?.isbn13 || "");
  const [weeks, setWeeks] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!borrower.trim() || !isbn13) return;
    const w = Math.max(1, Math.min(4, Number(weeks) || 1));
    onLoan?.(isbn13, borrower.trim(), w);
    setBorrower("");
    setWeeks(1);
    const next = availableBooks.find((b) => b.isbn13 !== isbn13);
    setIsbn13(next ? next.isbn13 : "");
  };

  return (
    <div className="loan-manager-page">
      <button
        onClick={onBack}
        className="button-update"
        style={{ marginBottom: 12 }}
      >
        ← Back to Catalog
      </button>

      <h2>Loan Management</h2>

      {availableBooks.length > 0 ? (
        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-row">
            <label>Borrower</label>
            <input
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
              placeholder="Borrower's name"
              required
            />
          </div>

          <div className="form-row">
            <label>Book</label>
            <select
              value={isbn13}
              onChange={(e) => setIsbn13(e.target.value)}
              required
            >
              <option value="">-- Select a book --</option>
              {availableBooks.map((b) => (
                <option key={b.isbn13} value={b.isbn13}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Period (weeks)</label>
            <input
              type="number"
              min={1}
              max={4}
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <button type="submit" className="button-primary">
              Create Loan
            </button>
          </div>
        </form>
      ) : (
        <p>All books are currently on loan.</p>
      )}

      <section className="loaned-list" style={{ marginTop: 24 }}>
        <h3>Currently on loan</h3>
        {loanedBooks.length > 0 ? (
          <ul className="loaned-ul">
            {loanedBooks.map((b) => {
              const due = b.loan?.dueDate
                ? new Date(b.loan.dueDate).toLocaleDateString()
                : "—";
              return (
                <li key={b.isbn13} className="loan-item">
                  <div className="loan-item-row">
                    <div>
                      <strong>{b.title}</strong>
                    </div>
                    <div>Borrower: {b.loan?.borrower || "—"}</div>
                    <div>Due: {due}</div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="button-delete"
                      onClick={() => onReturn?.(b.isbn13)}
                    >
                      Return
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No active loans.</p>
        )}
      </section>
    </div>
  );
}
