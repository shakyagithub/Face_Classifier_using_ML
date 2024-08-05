Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/upload", // Ensure this URL is correct and the server is configured to handle POST requests here
        method: "post", // Specify the method explicitly
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop files here or click to upload",
        dictRemoveFile: "Remove",
        autoProcessQueue: false,
        init: function() {
            this.on("addedfile", function(file) {
                if (this.files.length > 1) {
                    this.removeFile(this.files[0]);
                }
                // Center the preview in the dropzone
                file.previewElement.style.display = "flex";
                file.previewElement.style.flexDirection = "column";
                file.previewElement.style.alignItems = "center";
                file.previewElement.style.justifyContent = "center";
            });

            this.on("complete", function(file) {
                let imageData = file.dataURL;

                // Change this URL to the correct endpoint
                var url = "http://127.0.0.1:5000/classify_image";

                $.post(url, {
                    image_data: imageData
                }, function(data, status) {
                    if (!data || data.length == 0) {
                        $("#resultHolder").hide();
                        $("#divClassTable").hide();
                        $("#error").show();
                        return;
                    }
                    let players = ["katrina_kaif", "virat_kohli", "shalini_pandey", "salman_khan", "maria_sharapova"];

                    let match = null;
                    let bestScore = -1;
                    for (let i = 0; i < data.length; ++i) {
                        let maxScoreForThisClass = Math.max(...data[i].class_probability);
                        if (maxScoreForThisClass > bestScore) {
                            match = data[i];
                            bestScore = maxScoreForThisClass;
                        }
                    }
                    if (match) {
                        $("#error").hide();
                        $("#resultHolder").show();
                        $("#divClassTable").show();
                        $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                        let classDictionary = match.class_dictionary;
                        for (let personName in classDictionary) {
                            let index = classDictionary[personName];
                            let probabilityScore = match.class_probability[index];
                            let elementName = "#score_" + personName;
                            $(elementName).html(probabilityScore);
                        }
                    }
                }).fail(function() {
                    $("#error").show();
                });
            });

            this.on("removedfile", function(file) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").hide();
            });
        }
    });
    
    $("#submitBtn").on('click', function(e) {
        dz.processQueue();
    });
}

$(document).ready(function() {
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    init();
});
