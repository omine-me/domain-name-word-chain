const initializeAccordion = (details) => {
const summary = details.querySelector("summary");
const panel = details.querySelector("summary + *");

if (!(details && summary && panel)) return; // 必要要素が揃ってない場合は処理をやめる
let isTransitioning = false; // 連打防止フラグ

const onOpen = () => {
    if (details.open || isTransitioning) {
    return;
    }
    isTransitioning = true;
    panel.style.gridTemplateRows = "0fr";
    details.setAttribute("open", "");
    requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        panel.style.gridTemplateRows = "1fr";
    });
    });
    panel.addEventListener(
    "transitionend",
    () => {
        isTransitioning = false;
    },
    { once: true }
    );
};

const onClose = () => {
    if (!details.open || isTransitioning) {
    return;
    }
    isTransitioning = true;
    panel.style.gridTemplateRows = "0fr";
    panel.addEventListener(
    "transitionend",
    () => {
        details.removeAttribute("open");
        panel.style.gridTemplateRows = "";
        isTransitioning = false;
    },
    { once: true }
    );
};

summary.addEventListener("click", (event) => {
    event.preventDefault();

    if (details.open) {
    onClose();
    } else {
    onOpen();
    }
});
};

const accordion = document.getElementById("accordion");
initializeAccordion(accordion);