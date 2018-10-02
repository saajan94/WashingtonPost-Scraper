$(document).ready(function () {
    // Event handler for saving an article
    $(".save-btn").on("click", function (event) {
        event.preventDefault();
        var button = $(this);
        var id = button.attr("id");
        $.ajax(`/save/${id}`, {
            type: "PUT"
        }).then(function () {
            var alert = `
            <div class="alert alert-success alert-dismissable fade show" role="alert">
            This article has been saved! Go to "Saved Articles" to view it and add notes!
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>`
            button.parent().append(alert);
        });
    });

    // Event handler for deleting a saved article
    $(".delete-btn").on("click", function (event) {
        event.preventDefault();
        var id = $(this).attr("data");
        $.ajax(`/remove/${id}`, {
            type: "PUT"
        }).then(function () {
            location.reload();
        })
    });

    // Event handler to open note modal
    $(".note-btn").on("click", function (event) {
        event.preventDefault();
        var id = $(this).attr("data");
        $('#article-id').text(id);
        $('#save-note').attr('data', id);
        $.ajax(`/articles/${id}`, {
            type: "GET"
        }).then(function (data) {
            console.log(data)
            $('.notes-available').empty();
            if (data[0].note.length < 0) {
                data[0].note.forEach(notes => {
                    $('.notes-available').append($(`<li class='list-group-item'>${notes.text}<button type='button' class='btn btn-danger btn-sm float-right btn-deletenote' data='${notes._id}'>X</button></li>`));
                })
            } else {
                $('.notes-available').append($(`<li class='list-group-item'>No notes for this article yet</li>`));
                console.log("Second ran!")
            }
        })
        $('#note-modal').modal('toggle');
    });

    // Event listener to save note for article
    $("#save-note").click(function (event) {
        event.preventDefault();
        var id = $(this).attr('data');
        var noteText = $('#note-input').val().trim();
        $('#note-input').val('');
        $.ajax(`/note/${id}`, {
            type: "POST",
            data: { text: noteText }
        }).then(function (data) {
            console.log(data)
        })
        $('#note-modal').modal('toggle');
    });
});