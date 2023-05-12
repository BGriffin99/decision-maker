// Function add new option to create-poll page
document.getElementById("createOption").onclick = function () {
  let div = document.createElement("div");
  div.innerHTML = `
    <div class="poll-set">
      <div class="poll-option">
        <input type="text" class="form-control" id="option" name="choice">
      </div>
      <div class="poll-description">
        <input type="text" class="form-control" id="description" name="choicedescription">
      </div>
    </div>
    `;
  document.getElementsByClassName('poll-options')[0].appendChild(div);
};
