import store from "../../../redux/store";

const SwithcerClass = (selector) => document.getElementsByClassName(selector);

const setMargin = (className) => {
    const elements = SwithcerClass(className);
    for (let element of elements) {
        element.style.marginInline = "0px";
    }
};

export const updateTheme = (themeType, actionfunction) => {
    const theme = store.getState();

    const newTheme = {
        ...theme,
        "dataThemeMode": themeType === "dark" ? "dark" : "light",
        "dataHeaderStyles": "gradient",
        "dataMenuStyles": themeType === "dark" ? "dark" : "light",
        "defaultHeaderStyles": '',
        "darkBg": "",
        "bodyBg1": "",
        "bodyBg2": "",
        "inputBorder": "",
    };

    localStorage.setItem(`azira${themeType}theme`, themeType);
    localStorage.removeItem(`azira${themeType === "dark" ? "light" : "dark"}theme`);
    localStorage.setItem("aziraMenu", themeType);
    localStorage.setItem("aziraHeader", "gradient");
    localStorage.removeItem("aziradefaultHeader");
    localStorage.removeItem("darkBgRGB1");
    localStorage.removeItem("darkBgRGB2");
    localStorage.removeItem("darkBgRGB3");
    localStorage.removeItem("darkBgRGB4");
    localStorage.removeItem('primaryRGB');

    actionfunction(newTheme);
};

export const DirectionTheme = (directionType, actionfunction) => {
    const theme = store.getState();

    const dirtectionTheme = {
        ...theme,
        "dir": directionType,
    };

    localStorage.setItem(`azira${directionType}`, directionType);
    localStorage.removeItem(`azira${directionType === "ltr" ? "rtl" : "ltr"}`);

    actionfunction(dirtectionTheme);
};

export const updateLayout = (layoutType, actionfunction) => {

    const theme = store.getState();

    setTimeout(() => {
        const mainContent = SwithcerClass("main-content")[0];
        if (mainContent) {
            mainContent.click();
        }
    }, 100);

    let updatedTheme = {
        ...theme,
        "dataNavLayout": layoutType === "horizontal" ? "horizontal" : "vertical",
        "dataMenuStyles": layoutType === "horizontal" ? (localStorage.aziradarktheme ? 'dark' : localStorage.darkBgRGB1 ? 'dark' : localStorage.aziraMenu ? localStorage.aziraMenu : "light"): "light", 
        "dataVerticalStyle": layoutType === "vertical" ? "overlay" : "",
        "dataNavStyle": localStorage.aziranavstyles ? localStorage.aziranavstyles : "menu-click",
        "toggled": layoutType === "vertical" ? "" : undefined
    };

    localStorage.setItem("aziralayout", layoutType);
    if (layoutType === "vertical") {
        localStorage.removeItem("aziraverticalstyles");
    } else {
        localStorage.removeItem("aziraverticalstyles");
    }

    setMargin("main-menu");

    actionfunction(updatedTheme);
};

export const updateNavStyle = (actionType, toggledState, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataNavStyle": actionType,
        "dataVerticalStyle": "",
        "toggled": toggledState,
    });

    localStorage.setItem("aziranavstyles", actionType);
    localStorage.removeItem("aziraverticalstyles");

    setMargin("main-menu");

};

export const updateWidthStyle = (widthType, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataWidth": widthType,
    });

    localStorage.setItem(`azira${widthType}`, widthType); // Set the width-related item
    localStorage.removeItem(`azira${widthType === "fullwidth" ? "boxed" : "fullwidth"}`); // Remove the other width style
};

export const updateMenuPosition = (menuPosition, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataMenuPosition": menuPosition,
    });

    localStorage.setItem(`aziramenu${menuPosition}`, `${menuPosition}Menu`);
    localStorage.removeItem(`aziramenu${menuPosition === "fixed" ? "scrollable" : "fixed"}`);
};

export const updateHeaderPosition = (headerPosition, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataHeaderPosition": headerPosition,
    });

    localStorage.setItem(`aziraheader${headerPosition}`, `${headerPosition}Header`);
    localStorage.removeItem(`aziraheader${headerPosition === "fixed" ? "scrollable" : "fixed"}`);
};

export const updatePageStyle = (pageStyle, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataPageStyle": pageStyle,
    });

    localStorage.setItem(`azira${pageStyle}`, pageStyle.charAt(0).toUpperCase() + pageStyle.slice(1));
    ["regular", "classic", "modern"].forEach(style => {
        if (style !== pageStyle) {
            localStorage.removeItem(`azira${style}`);
        }
    });
};

export const updateBgImage = (imageKey, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "bgImg": imageKey
    });

    localStorage.setItem(imageKey, imageKey);
    for (let i = 1; i <= 5; i++) {
        if (`bgimage${i}` !== imageKey) {
            localStorage.removeItem(`bgimage${i}`);
        }
    }
};

export const updateMenuStyle = (menuStyle, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataMenuStyles": menuStyle,
    });
    localStorage.setItem("aziraMenu", menuStyle);
    localStorage.removeItem("light");
};

export const updateHeaderStyle = (headerStyle, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "defaultHeaderStyles": "",
        "dataHeaderStyles": headerStyle,
    });
    localStorage.setItem("aziraHeader", headerStyle);
    localStorage.removeItem("aziradefaultHeader");
};

export const updateDefaultHeaderStyle = (headerStyle, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "defaultHeaderStyles": headerStyle,
        "dataHeaderStyles": "",
    });
    localStorage.setItem("aziradefaultHeader", headerStyle);
    localStorage.removeItem("aziraHeader");
};

export const updatePrimaryColor = (colorRgb, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "colorPrimaryRgb": colorRgb,
    });
    localStorage.setItem("primaryRGB", colorRgb);
};

export const updateBackgroundColor = (bgColor1, bgColor2, darkBg, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "bodyBg1": bgColor1,
        "bodyBg2": bgColor2,
        "darkBg": darkBg,
        "inputBorder": "255, 255, 255, 0.1",
        "dataThemeMode": "dark",
        "dataMenuStyles": "dark",
        "dataHeaderStyles": "gradient",
        "defaultHeaderStyles": "",
    });
    
    localStorage.setItem('darkBgRGB1', bgColor1);
    localStorage.setItem('darkBgRGB2', bgColor2);
    localStorage.setItem('darkBgRGB3', darkBg);
    localStorage.setItem('darkBgRGB4', "255, 255, 255, 0.1");
    
    localStorage.removeItem("aziradefaultHeader");
    localStorage.setItem("aziraHeader", "gradient");
};

export const updateMenuStyles = (verticalStyle, toggled, actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataNavLayout": "vertical",
        "dataVerticalStyle": verticalStyle,
        "toggled": toggled || "", 
        "dataNavStyle": "",
    });
    localStorage.setItem("aziraverticalstyles", verticalStyle);
    localStorage.removeItem("aziranavstyles");
};
