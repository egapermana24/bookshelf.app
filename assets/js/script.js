const books = [];
const RENDER_EVENT = "render-book";

// berfungsi untuk menjalankan kode saat semua elemen HTML sudah selesai di-load
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// fungsi addbook
function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const check = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    check,
    false
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// fungsi untuk mengenerate id
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, check, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    check,
    isCompleted,
  };
}

// fungsi untuk menampilkan book yang telah dibuat
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBooks = document.getElementById("incompleteBookshelfList");
  incompleteBooks.innerHTML = "";
  const completeBooks = document.getElementById("completeBookshelfList");
  completeBooks.innerHTML = "";

  for (const book of books) {
    const bookElement = createBook(book);
    if (!book.check) {
      incompleteBooks.append(bookElement);
    } else {
      completeBooks.append(bookElement);
    }
  }
});

// fungsi untuk menangani book yang telah di buat
function createBook(bookObject) {
  const bookElement = document.createElement("article");
  bookElement.classList.add("book_item");

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;
  bookElement.append(bookTitle);

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis : " + bookObject.author;
  bookElement.append(bookAuthor);

  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun : " + bookObject.year;
  bookElement.append(bookYear);

  const bookAction = document.createElement("div");
  bookAction.classList.add("action");
  bookElement.append(bookAction);

  // kondisi jika checkbox di centang
  if (bookObject.check) {
    const unCompleteButton = document.createElement("button");
    unCompleteButton.classList.add("green");
    unCompleteButton.innerText = "Belum Selesai dibaca";

    unCompleteButton.addEventListener("click", function () {
      bookUnCompleteHandler(bookObject.id);
    });
    bookAction.append(unCompleteButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("outline");
    deleteButton.innerText = "Hapus";

    deleteButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });

    bookAction.append(deleteButton);

    const edit = document.createElement("button");
    edit.classList.add("outline");
    edit.innerText = "Edit";

    edit.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    bookAction.append(edit);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Selesai Baca";

    completeButton.addEventListener("click", function () {
      bookCompleteHandler(bookObject.id);
    });
    bookAction.append(completeButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("outline");
    deleteButton.innerText = "Hapus";

    deleteButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });

    bookAction.append(deleteButton);

    const edit = document.createElement("button");
    edit.classList.add("outline");
    edit.innerText = "Edit";

    edit.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    bookAction.append(edit);
  }
  saveData();

  return bookElement;
}

// fungsi edit book melalui prompt
function editBook(bookId) {
  const book = findBook(bookId);

  const title = prompt("Edit Judul Buku", book.title);
  const author = prompt("Edit Nama Penulis", book.author);
  const year = prompt("Edit Tahun Terbit", book.year);
  // mengambil nilai dari local storage jika prompt kosong
  if (title == null || title == "" || title == undefined) {
    title = book.title;
  }
  if (author == null || author == "" || author == undefined) {
    author = book.author;
  }
  // jika year tidak sama dengan angka maka akan memberikan alert
  if (year == null || year == "" || year == undefined) {
    year = book.year;
  } else if (isNaN(year) || year.length > 4 || year.length < 4) {
    alert("Tahun harus berupa angka dan 4 digit");
    return editBook(bookId);
  } else {
    book.title = title;
    book.author = author;
    book.year = year;

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// fungsi bookCompleteHandler
function bookCompleteHandler(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == -1) return;

  bookTarget.check = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// findBook
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}
//  fungsi bookUnCompleteHandler
function bookUnCompleteHandler(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.check = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// fungsi deleteBook
function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId);

  if (bookIndex == -1) return;

  // konfirmasi hapus
  const confirm = window.confirm("Apakah anda yakin ingin menghapus buku ini?");
  if (confirm) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  } else {
    return;
  }
}

// findBookIndex
function findBookIndex(bookId) {
  let index = 0;
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return index;
    }
    index++;
  }
  return -1;
}

// fungsi saveData
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));

    // kosongkan form
    document.getElementById("inputBookTitle").value = "";
    document.getElementById("inputBookAuthor").value = "";
    document.getElementById("inputBookYear").value = "";
    document.getElementById("inputBookIsComplete").checked = false;
  }
}

// cek apakah browser support localstorage

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

//fungsi loadData from storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// ketika di ketik langsung mencari buku
function searchBook() {
  const searchBook = document.getElementById("searchBookTitle").value;
  const incompleteBooks = document.getElementById("incompleteBookshelfList");
  incompleteBooks.innerHTML = "";
  const completeBooks = document.getElementById("completeBookshelfList");
  completeBooks.innerHTML = "";

  for (const book of books) {
    const bookElement = createBook(book);
    if (book.title.toLowerCase().includes(searchBook.toLowerCase())) {
      if (!book.check) {
        incompleteBooks.append(bookElement);
      } else {
        completeBooks.append(bookElement);
      }
    }
  }
}

// jangan reload ketika klik searchSubmit
searchSubmit.addEventListener("click", function (event) {
  event.preventDefault();
  searchBook();
});

// searchBookTitle langsung ketika di ketik
searchBookTitle.addEventListener("keyup", function () {
  searchBook();
});

// ketika tombol check di centang langsung mengganti tulisan belum selesai dibaca menjadi selesai dibaca di button
function checkBook() {
  const checkBook = document.getElementById("inputBookIsComplete");
  const span = document.getElementsByTagName("span")[0];
  if (checkBook.checked) {
    span.innerText = "Selesai dibaca";
  } else {
    span.innerText = "Belum selesai dibaca";
  }
}

// ketika di klik langsung mengganti tulisan belum selesai dibaca menjadi selesai dibaca
inputBookIsComplete.addEventListener("click", function () {
  checkBook();
});

// kembalikan tulisan seperti semula ketika data sudah di simpan
function resetCheckBook() {
  const span = document.getElementsByTagName("span")[0];
  span.innerText = "Belum selesai dibaca";
}

// gunakan function resetCheckBook ketika data sudah di simpan
document.addEventListener(SAVED_EVENT, function () {
  resetCheckBook();
});
