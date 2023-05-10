// Client facing scripts here

// Function drag and drop for show-poll.ejs

document.addEventListener('DOMContentLoaded', (event) => {

  // This code will set the column's opacity when the user begins dragging it,
  // then return it to 100% when the dragging event ends.
  function handleDragStart(e) {
    this.style.opacity = '1';
    //store the source element's HTML when the drag starts
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }

  function handleDragEnd(e) {
    this.style.opacity = '1';
    items.forEach(function (item) {
      item.classList.remove('over');
    });
  }
  // Function adds the over class when the column is dragged over, and remove it when leave.
  function handleDragOver(e) {
    e.preventDefault();
    return false;
  }

  function handleDragEnter(e) {
    this.classList.add('over');
  }

  function handleDragLeave(e) {
    this.classList.remove('over');
  }

  // Functions for the mobile screen --------------
  let dragSrcEl = null;
  let activeElement = null;
  let initialPosition = null;

  const handleTouchStart = function (e) {
    e.preventDefault();
    console.log('handleTouchStart');
    this.style.opacity = '0.5';
    activeElement = this;
    initialPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function handleTouchMove(e) {
    e.preventDefault();
    if (activeElement) {
      const currentPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const dx = currentPos.x - initialPosition.x;
      const dy = currentPos.y - initialPosition.y;
      activeElement.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }
  //--------------------------------

  let items = document.querySelectorAll('.vote-form .vote-set');
  items.forEach(function (item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('dragend', handleDragEnd);

    item.addEventListener('touchstart', handleTouchStart);
    item.addEventListener('touchend', handleDragEnd);
    item.addEventListener('touchmove', handleTouchMove);

    item.addEventListener('drop', handleDrop); // new handler in amongst the other handlers
  });

  function handleDrop(e) {
    e.stopPropagation(); // stops the browser from redirecting
    // Set the source column's HTML to the HTML of the target column that you dropped on,
    // first checking that the user is not dropping back onto the same column they dragged from
    if (dragSrcEl !== this) {
      dragSrcEl.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData('text/html'); //drop item to the new location
    }
    return false;
  }
});


//------------------------------------------------------------------------------------------------
// Function add new option to create-poll page
document.getElementById("createOption").onclick = function () {
  let div = document.createElement("div");
  div.innerHTML = `
    <div class="poll-set">
      <div class="poll-option">
        <input type="text" class="form-control" id="option" name="choice" required>
      </div>
      <div class="poll-description">
        <input type="text" class="form-control" id="description" name="choicedescription">
      </div>
    </div>
    `;
  document.getElementsByClassName('poll-options')[0].appendChild(div);
};

//-------------------------------------------------------------------------------------------------




