function changeLocale(){
    const selected_lang = document.getElementById("locale-switcher").value;
    if (selected_lang === document.documentElement.lang){
        return;
    }
    if (selected_lang === "ja"){
        window.location.href =  baseurl;
    }else{
        window.location.href =  baseurl + "/" + selected_lang;
    }
}
function submit() {
    document.getElementById("submit_btn").disabled = true;
    input_val = document.getElementById("input");
    input_val.value = input_val.value.toLowerCase();
    // 連続するドットを削除
    input_val.value = input_val.value.replace(/\.{2,}/g, ".");
    if (input_val.value.slice(-1) === ".") {
        input_val.value = input_val.value.slice(0, -1);
    }
    domain = input_val.value;
    checkDomainExists(domain).then(result => {
        if (result.exists) {
          addToDomainList(domain, true);
        } else {
            addToDomainList(domain, false);
            updateRemainingLives();
        }
    });
    input_val.value = "";
    input_val.focus();
}
function checkValidDomain(){
    const domain = document.getElementById("input").value;
    if(domain === ""){
        document.getElementById("submit_btn").disabled = true;
        document.getElementById("warning_text").textContent = "";
        return;
    }

    // document.getElementById("domain_list")のliタグを全部取得して、doaminと比較
    const domain_list = document.getElementById("domain_list").getElementsByTagName("li");
    // make domain lowercase and remove last "."" if exists
    const sanitaized_domain = domain.toLowerCase().replace(/\.$/, "");
    for(let i = 0; i < domain_list.length; i++){
        // get first span of domain_list[i]
        list_domain_text = domain_list[i].getElementsByTagName("div")[0].getElementsByTagName("span")[0].textContent;
        if(list_domain_text === sanitaized_domain){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("no_same_domain_error");
            return;
        }
        if (i == domain_list.length - 1) {
            if(list_domain_text.slice(-1) !== domain.slice(0, 1).toLowerCase()){
                document.getElementById("submit_btn").disabled = true;
                document.getElementById("warning_text").textContent = getTranslatedText("not_a_valid_start_character", {"start_character": list_domain_text.slice(-1)});
                return;
            }
        }
    }

    if(domain.match(/^[a-zA-Z0-9.-]+$/)){
        // 先頭にドットがないか
        if(domain[0] === "."){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("cannot_start_with_dot");
            return;
        }
        //連続するドットがないか
        if(domain.match(/\.{2,}/)){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("cannot_use_consecutive_dots");
            return;
        }
        // 末尾以外に一つ以上のドットがあるか
        if(!domain.slice(0, -1).includes(".")){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("no_dot_in_the_middle");
            return;
        }
        // 先頭や末尾にハイフンがあるか
        if(domain[0] === "-"){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("cannot_start_with_hyphen");
            return;
        }
        if(domain.slice(-1) === "-"){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("cannot_end_with_hyphen");
            return;
        }

        document.getElementById("submit_btn").disabled = false;
        document.getElementById("warning_text").textContent = "";
    }else{
        // 空白が含まれている場合
        if(domain.match(/\s/)){
            document.getElementById("submit_btn").disabled = true;
            document.getElementById("warning_text").textContent = getTranslatedText("cannot_use_space");
            return;
        }

        document.getElementById("submit_btn").disabled = true;
        document.getElementById("warning_text").textContent = getTranslatedText("invalid_format");
    }
}
function addToDomainList(domain, exists) {
    if (exists){
        // <li><div class="domain_li></div><li>
        var child = document.createElement("li");
        child.innerHTML = `<div class="domain_li_div"><span class="domain_text">${domain}</span><span class="point_li">${calcPoint(domain)}</span></div>`;
    }else{
        // <div class="missed_domain"></div>
        var child = document.createElement("div");
        child.classList.add("missed_domain");
        child.innerHTML = `<span class="domain_text">${domain}</span>`;
    }
    document.getElementById("domain_list").appendChild(child);
}
function calcPoint(domain){
    let point = 0;
    // ドメインの文字数に応じてポイントを返す
    const domain_length = domain.length
    point += 1.5 ** domain_length;

    // tldのポイント
    const tld = domain.split(".").pop();
    // top 3 non ccTLD TLD: com, net, org
    // 2 - 1/(x)
    if (tld=="com"){
        point *= (2 - 1/1);
    }
    else if (tld=="net"){
        point *= (2 - 1/2);
    }
    else if (tld=="org"){
        point *= (2 - 1/3);
    }
    else{
        point *= 2;
    }

    // サブドメインの数に応じてポイントを追加
    const subdomain_count = domain.split(".").length-1;
    point *= (1.5 ** (subdomain_count-1));

    return parseInt(point);
}
function updateRemainingLives() {
    const hearts = document.getElementById("hearts");
    // count the number of broken hearts
    const brokenHearts = hearts.querySelectorAll("img[data-isbroken]").length;
    if (brokenHearts === 2) {
        document.getElementById("resultModal").style.display = "block";
        document.getElementById("resultDomainListContainer").innerHTML = document.getElementById("domain_list").outerHTML;
        const pt = getPointSum();
        document.getElementById("resultPoint").innerHTML = pt + " pt!";
        const domain_count = document.getElementById("domain_list").getElementsByTagName("li").length;
        document.getElementById("shareBtn").href = getTranslatedText("share_url", {"domain_count": domain_count, "point": pt, "url_of_this_site": location.href});
        return;
    } else {
        if (brokenHearts === 1) {
            hearts.classList.add("wiggle");
        }
        // 最後❤️を減らして💔を追加
        hearts.innerHTML = heart_inter_html.repeat(3 - (brokenHearts+1)) + broken_heart_inter_html.repeat(brokenHearts+1);
    }
}
function getPointSum(){
    let sum = 0;
    const domain_list = document.getElementById("domain_list").getElementsByTagName("li");
    for(let i = 0; i < domain_list.length; i++){
        // get first span of domain_list[i]
        point = domain_list[i].getElementsByTagName("div")[0].getElementsByTagName("span")[1].textContent;
        sum += parseInt(point);
    }
    return sum;
}
async function checkDomainExists(domain) {
    const ipv4Url = `https://dns.google.com/resolve?name=${domain}&type=A`;
    const ipv6Url = `https://dns.google.com/resolve?name=${domain}&type=AAAA`;
  
    try {
      // まずIPv4リクエストを送信
      const ipv4Response = await fetch(ipv4Url);
      const ipv4Data = await ipv4Response.json();
  
      // IPv4が成功し、Statusが0ならドメインは存在する
      if (ipv4Data.Status === 0 && ipv4Data.Answer) {
        return { exists: true };
      }
    } catch (error) {
      // IPv4でエラーが発生した場合、IPv6リクエストにフォールバック
      console.warn("IPv4 request failed, attempting IPv6...", error);
    }
  
    try {
      // IPv6リクエストを送信
      const ipv6Response = await fetch(ipv6Url);
      const ipv6Data = await ipv6Response.json();
  
      // IPv6が成功し、Statusが0ならドメインは存在する
      if (ipv6Data.Status === 0 && ipv6Data.Answer) {
        return { exists: true };
      }
    } catch (error) {
      console.warn("IPv6 request also failed.", error);
    }
  
    // どちらも失敗またはドメインが存在しない場合
    return { exists: false };
}
function playAgain(){
    document.getElementById("resultModal").style.display = "none";
    document.getElementById("domain_list").innerHTML = '<li><div class="domain_li_div"><span class="domain_text">www.google.com</span><span class="point_li">0</span></div></li>';
    document.getElementById("hearts").innerHTML = heart_inter_html.repeat(3);
    document.getElementById("hearts").classList.remove("wiggle");
    document.getElementById("submit_btn").disabled = true;
    document.getElementById("warning_text").textContent = "";
    document.getElementById("input").value = "m";
    document.getElementById("input").focus();
}
function getTranslatedText(key, args={}) {
    let text = translations[key][document.documentElement.lang];
    if (args) {
        console.log(args);
        Object.keys(args).forEach(key => text = text.replace("$"+key+"$", args[key]));
    }
    return text;
}


let translations = {};
let heart_inter_html;
let broken_heart_inter_html;
// ローカルのテストための三項演算子
const baseurl = !window.location.href.startsWith('file://') ? window.location.protocol + "//" + window.location.host : window.location.href.substring(0, window.location.href.lastIndexOf('/')).replace("/en", "");
fetch(baseurl + '/lang.json')
  .then(response => response.json())
  .then(jsonData => {
    translations = jsonData;
    heart_inter_html = `<img class="heart" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2665.svg" alt="${getTranslatedText("heart")}">`;
    broken_heart_inter_html = `<img class="heart" data-isbroken="true" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f494.svg" alt="${getTranslatedText("broken_heart")}">`;
    playAgain();
  })
  .catch(err => {
    console.error('Error loading Language JSON file:', err);
});

document.getElementById('submit_btn').addEventListener(
    'click',
    function () {
        window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            e.returnValue = '遷移';
        });
    },
    { once: true }
);