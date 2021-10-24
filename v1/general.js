function makeForm(formType, formDefault, formOption, id){
  let formDom = "";
  if (formType == "input") {
    formDom = $(`<input type="text" class="form-control form-control-sm" placeholder="" aria-label="" value="${formDefault}">`);
  } else if (formType == "number") {
    formDom = $(`<input type="text" class="form-control form-control-sm input-number" placeholder="" aria-label="" value="${formDefault}">`);
  } else if (formType == "textarea") {
    formDom = $(`<textarea class="form-control form-control-sm auto-resize" rows="1" placeholder="" value="${formDefault}"></textarea>`);
  } else if (formType == "select") {
    formDom = $(`<div class="dropdown dropdown-option"><input type="text" class="form-control form-control-sm searchformss dropdown-toggle" data-toggle="dropdown" placeholder="" value=""><div class="dropdown-menu"></div></div>`);
    let options = formOption.split('／');
    for (let i = 0; i < options.length; i++) {
      let optionDom = $(`<option>${options[i]}</option>`);
      formDom.find(".dropdown-menu:last").append(`<a class="dropdown-item hearing-item-option">${options[i]}</a>`);
    }
  } else if (formType == "checkbox") {
    formDom = $(`<div class="checkbox-wrap"></div>`);
    let options = formOption.split('／');
    for (let i = 0; i < options.length; i++) {
      let optionDom = $(`<div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" id="${id}-${options[i]}" value="${options[i]}"><label class="form-check-label" for="${id}-${options[i]}">${options[i]}</label></div>`);
      formDom.append(optionDom);
    }
  }
  return formDom;
}

function makeBRtag(string) {
  return string.replace(/▶/g, "<br>")
}


// フォームの描画
$(document).ready(function () {
  let structure = JSON.parse($("#data-structure").html());
  let hearingDom = $("#hearing-item-wrap");
  for (let i = 0; i < structure.length; i++) {
    let id = structure[i]["id"];
    let parent = structure[i]["parent"];
    let idsimple = id.split('-').slice(-1)[0];
    let level = structure[i]["level"];
    let prefix = (level >= 2) ? "" : "";
    let type = structure[i]["type"];
    let name = structure[i]["name"];
    let required = ""; // 実験では重要度をつけない
    // let required = (structure[i]["form"]["required"] == "1")? "*" : "";
    let eachDom = $(`<div id="${id}" data-parent="${parent}" class="hearing-each-wrap level-${level} ${type}"  data-name="${name}"><div class="hearing-each-name">${prefix}(${idsimple}) ${name}${required}</div></div>`);
    if (type=="terminal") {
      eachDom.append($(`<div class="form-wrap"><div class="form-main"></div></div>`));
      let dependence = structure[i]["form"]["dependence"];
      let description = structure[i]["form"]["description"];
      let example = structure[i]["form"]["example"];
      eachDom.attr("data-dependence", dependence);
      eachDom.attr("data-description", description);
      eachDom.attr("data-example", example);
      let mainDom = makeForm(structure[i]["form"]["form-main"], structure[i]["form"]["form-main-default"], structure[i]["form"]["form-main-option"], id);
      eachDom.find(".form-main").append(mainDom);
      if (structure[i]["form"]["form-sub"] != "") {
        let subDom = makeForm(structure[i]["form"]["form-sub"], structure[i]["form"]["form-sub-default"], "", id);
        subDom.attr("placeholder", "詳細");
        eachDom.find(".form-wrap").append($(`<div class="form-sub"></div>`));
        eachDom.find(".form-sub").append(subDom);
      }
    }
    hearingDom.append(eachDom);
  }
});

// textareaの動的リサイズ
$(function () {
  $(document).on('change keyup keydown paste cut',
    'textarea.auto-resize', function () {
    if ($(this).outerHeight() > this.scrollHeight) {
      $(this).height(1)
    }
    while ($(this).outerHeight() < this.scrollHeight) {
      $(this).height($(this).height() + 1)
    }
  });
});

// ヒアリング項目マウスオーバー
$(document).on("mouseenter", ".form-control", function () {
  $(this).addClass("highlight");
});
$(document).on("mouseleave", ".form-control", function () {
  $(this).removeClass("highlight");
});


// ガイドの生成と移動
function makeGuide (id) {
  let structure = JSON.parse($("#data-structure").html());
  let targetDom = $("#"+id);
  let guideDom = $("#guide-wrap");
  let name = targetDom.attr("data-name");
  let description = targetDom.attr("data-description");
  let examples = targetDom.attr("data-example").split("／");
  let id_last = id.split('-').slice(-1)[0];
  let heading = `(${id_last}) ${name}`;
  let parent_id = targetDom.attr("data-parent");;

  guideDom.attr("data-id", id);

  // 見出しの作成
  while (parent_id != "root") {
    for (var i = 0; i < structure.length; i++) {
      if (structure[i]["id"] == parent_id){
        let id_last = parent_id.split('-').slice(-1)[0];
        heading = `(${id_last}) ${structure[i]["name"]} ＞ ${heading}`;
        parent_id = structure[i]["parent"];
      }
    }
  }
  guideDom.find(".guide-label").html(heading.replace("に関する情報", ""));

  // 説明の作成
  guideDom.find(".guide-description").html(makeBRtag(description));

  // 例の作成
  guideDom.find(".example-wrap").empty();
  for (var i = 0; i < examples.length; i++) {
    if (examples[i] != "") {
      let example = examples[i].replace("[", '<span class="katsuyo-db badge badge-dark">').replace("]", '</span>');
      let exampleDom = $(`<div class="each-example"><span class="badge badge-secondary">例</span><div class="example">${makeBRtag(example)}</div></div>`);
      guideDom.find(".example-wrap").append(exampleDom);
    }
  }

  // 表示アニメーション
  $(".guide-item-wrap").css({display: "none"});
  // $(".guide-item-wrap").removeClass("hidden");
  $(".guide-item-wrap").css({
    top: targetDom.offset().top - 152
  });
  $(".guide-item-wrap").fadeIn(700);
  // $(".guide-item-wrap").animate({
  //   top: targetDom.offset().top - 125
  // }, 500);

}

// ターミナル項目のクリック
$(document).on('click', '.terminal .hearing-each-name', function () {
  let targetDom = $(this);
  if (targetDom.hasClass("marker")) {
    targetDom.removeClass("marker");
    $(".guide-item-wrap").css({ display: "none" });

  } else {
    $(".marker").removeClass("marker");
    targetDom.addClass("marker");
    let id = targetDom.parent().attr("id");
    makeGuide(id);
  }
});

// input要素へのフォーカス時
$(document).on('focus', '.hearing-each-wrap .form-control', function () {
  let targetDom = $(this).parents(".terminal").children(".hearing-each-name");
  $(".marker").removeClass("marker");
  targetDom.addClass("marker");
  let id = targetDom.parent().attr("id");
  let currentGuideId = $("#guide-wrap").attr("data-id");
  if (id != currentGuideId) {
    makeGuide(id);
  }
  $(".guide-item-wrap").removeClass("hidden");
});

// checkbox要素クリック時
$(document).on('click', '.hearing-each-wrap .checkbox-wrap', function () {
  let targetDom = $(this).parents(".terminal").children(".hearing-each-name");
  $(".marker").removeClass("marker");
  targetDom.addClass("marker");
  let id = targetDom.parent().attr("id");
  let currentGuideId = $("#guide-wrap").attr("data-id");
  if (id != currentGuideId) {
    makeGuide(id);
  }
  $(".guide-item-wrap").removeClass("hidden");
});


// ドロップダウン選択時
$(document).on('click', 'a.hearing-item-option', function () {
  let subItem = $(this).html();
  $(this).parents(".dropdown").find("input").val(subItem);

  // 依存関係の選択肢の動的な生成
  let id = $(this).parents(".hearing-each-wrap").attr("id");
  let dependence = JSON.parse($("#data-dependence").html());  

  if (!dependence[id]) {
    return null;
  }

  let option = JSON.parse($("#data-option").html());

  for (let i = 0; i < dependence[id].length; i++) {
    let targetId = dependence[id][i][0];
    let queryIds = dependence[id][i][1];
    let keyString = "";

    for (let j = 0; j < queryIds.length; j++) {
      let input = $("#" + queryIds[j]).find("input").val();
      keyString += input
    }

    let targetDom = $("#" + targetId).find(".dropdown-menu");
    targetDom.empty();

    // keyStringがoptionでマッチする時のみ選択肢を生成
    if (!option[targetId][keyString]) {
      break;
    }
    let targetOptions = option[targetId][keyString].split("／");
    for (let i = 0; i < targetOptions.length; i++) {
      targetDom.append(`<a class="dropdown-item hearing-item-option">${targetOptions[i]}</a>`);
    }
  }

});

// シートの印刷
$(document).on('click', '#print-sheet', function () {
  //印刷したいエリアの取得
  let basicDom = $("#basic-info-wrap").clone();
  let sheetDom = $("#hearing-wrap").clone();

  //印刷用の要素「#print」を作成
  $('body').append('<div id="print"></div>');
  $('#print').append(basicDom);
  $('#print').append(sheetDom);

  //「#print」以外の要素に非表示用のclass「print-off」を指定
  $('body > :not(#print)').addClass('print-off');
  window.print();

  //window.print()の実行後、作成した「#print」と、非表示用のclass「print-off」を削除
  $('#print').remove();
  $('.print-off').removeClass('print-off');
});

// フォームの中身を取得する関数
function getFormAnswer(formDom) {
  let text = "";
  let input = formDom.find(".form-control").val();
  let checked = []
  formDom.find(".form-check-input:checked").each(function (index, element) {
    checked.push($(element).val());
  });
  text += input ? input : "";
  text += checked ? checked.join("/") : "";
  text = text.replace(/\r\n|\r|\n/g, "▶");
  return text;
}

// シートの出力
$(document).on('click', '#output-sheet', function () {

  // BOMの用意（文字化け対策）
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

  // TSVデータの用意
  // id, name, answer, description
  let tsv_data = "ID\t項目\t回答結果\t説明\r\n";
  $(".hearing-each-wrap").each(function (index, element) {
    let id = $(element).attr("id");
    let name = $(element).attr("data-name");
    let description = $(element).attr("data-description");
    if (!description) {
      description = "";
    }
    let mainDom = $(element).find(".form-main");
    let subDom = $(element).find(".form-sub");
    let answerText = getFormAnswer(mainDom);
    let subAnswerText = getFormAnswer(subDom);
    if (subAnswerText != "") {
      answerText += ": ";
      answerText += subAnswerText;
    }
    tsv_data = tsv_data + id + "\t" + name + "\t" + answerText + "\t" + description + "\r\n";
  });

  let blob = new Blob([bom, tsv_data], { type: 'text/tsv' });

  let url = (window.URL || window.webkitURL).createObjectURL(blob);

  let downloader = document.getElementById('downloader');
  downloader.download = 'hearing-sheet.tsv';
  downloader.href = url;

  // ダウンロードリンクをクリックする
  $('#downloader')[0].click();

});
