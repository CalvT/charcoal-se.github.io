/* globals fileSize, listify, userscriptParser */

function fail() {
  console.error(arguments);
}
(function _f() {
  if (window.userscriptParser && window.listify && window.fileSize) {
    $.get("https://api.github.com/repos/charcoal-se/userscripts/git/trees/master?recursive=1", initUserscripts).fail(function () {
      setTimeout(_f, 1000)
      fail.apply(this, arguments)
    });
  } else {
    setTimeout(_f, 100)
  }
})()
function initUserscripts (tree) {
  var $ul = $("ul.scripts").empty().css({
    listStyleType: "none",
    listStylePosition: "inside"
  });
  tree.tree.forEach(function (file) {
    if (/\.user\.js$/.exec(file.path)) {
      var $li = $("<li></li>").text("Loading " + file.path + " info…");
      $ul.append($li);
      $.get(file.url, function (blob) {
        var text = atob(blob.content);
        var meta = userscriptParser(text);

        var authors = (meta.author || []).concat(meta.contributor || []);
        var authorInfo = "";
        if (authors.length > 0) {
          authorInfo = " by " + listify(authors);
        }
        var description = $("<em></em>").text("No description");
        if (meta.desc && !meta.description) {
          meta.description = meta.desc;
        }
        if (meta.description.length > 0) {
          description = $("<p></p>").css({
            marginLeft: "1em"
          });
          const italicText = getMeta(meta, file, blob);
          if (italicText.length > 0) {
            description
              .append($("<em></em>").text(italicText))
              .append($("<br />"));
          }
          meta.description.forEach(function (line) {
            description.append(line).append($("<br />"));
          });
          description.children(":last-child").remove();
        }
        $li.empty().append(
          $("<p></p>").append(
            $("<details></details>")
              .append($("<summary></summary>").append(
                $("<a></a>")
                  .text(meta.name.join(", ") + authorInfo)
                  .attr("href", "https://github.com/Charcoal-SE/userscripts/raw/master/" + file.path)
                  .css({
                    marginLeft: "0.5em"
                  })
              ))
              .append(description)
          )
        );
      }).fail(fail);
    }
  });
}

function getMeta(meta, file /* blob */) {
  var joiner = " • ";
  return [
    meta.version.length && meta.version.map(function (v) {
      return "v" + v;
    }).join(joiner),
    fileSize(file.size).human("si")
  ].filter(function (v) {
    return v;
  }).join(joiner);
}
