(function () {

    "use strict";

    const scrollSpace = document.getElementById("servicesScrollSpace");
    const viewport = document.getElementById("servicesViewport");
    const list = document.getElementById("servicesList");
    const heroSection = document.getElementById("home");
    const agentText = document.getElementById("servicesAgentText");
    const serviceItems = document.querySelectorAll(".service-item");
    const listTrack = document.createElement("div");

    if (!scrollSpace || !viewport || !list) {
        return;
    }

    let running = false;
    let listRevealed = false;
    let listUnlockAt = 0;
    let listScrollCurrent = 0;
    let listMaxScroll = 0;
    let spaceTop = 0;
    let spaceHeight = 0;
    let viewportHeight = 0;

    /* =========================================
       QUOTE
    ========================================= */

    let quoteOpacityCur = 0;
    let quoteYCur = 28;
    let quoteScaleCur = 0.96;

    let decorOpacityCur = 0.55;

    let headingOpacityCur = 0;
    let headingYCur = 24;

    let lastQuoteOpacity = "";
    let lastQuoteY = "";
    let lastQuoteScale = "";
    let lastDecorOpacity = "";
    let lastHeadingOpacity = "";
    let lastHeadingY = "";

    /* =========================================
       AGENT
    ========================================= */

    let agentOpacityCur = 0;
    let agentYCur = 90;
    let agentScaleCur = 0.72;
    let agentBlurCur = 18;

    let lastAgentOpacity = "";
    let lastAgentY = "";
    let lastAgentScale = "";
    let lastAgentBlur = "";

    let agentPrepared = false;

    /* =========================================
       LIST
    ========================================= */

    let lastListTop = -1;
    let listOrigin = 0.74;
    let listSpan = 0.26;
    let listScrollArmed = false;
    let lastListProgress = 0;

    let listStart = 0;
    let listTravel = 1;
    let listRunway = 1;
    let listIntro = 1;
    let listFirstStep = 1;

    const listRevealAt = 0.58;

    let legacyDistance = 1;
    let metricsReady = false;

    /* =========================================
       NAVIGATION
    ========================================= */

    let navJumping = false;
    let navJumpTarget = 0;
    let navWatching = false;


    /* =========================================
       HELPERS
    ========================================= */

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }


    function lerp(start, end, amount) {
        return start + (end - start) * amount;
    }


    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }


    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }


    function approach(current, target, amount) {
        const next = current + (target - current) * amount;

        return Math.abs(target - next) < 0.001
            ? target
            : next;
    }


    /* =========================================
       HERO PROGRESS
       0   = Hero just started
       0.5 = Hero 50% moved
       1   = Hero completely moved
    ========================================= */

    function getHeroProgress() {

        if (!heroSection) {
            return 1;
        }

        const rect = heroSection.getBoundingClientRect();

        const heroHeight = Math.max(
            heroSection.offsetHeight,
            rect.height,
            1
        );

        const heroTop =
            rect.top + window.pageYOffset;

        const heroScrolled =
            window.pageYOffset - heroTop;

        return clamp(
            heroScrolled / heroHeight,
            0,
            1
        );
    }


    /* =========================================
       MOVE AGENT OUT OF SERVICES VIEWPORT

       This allows the Agent to remain visible
       during the Hero → Services transition.
    ========================================= */

    function prepareAgentLayer() {

        if (!agentText || agentPrepared) {
            return;
        }

        agentPrepared = true;

        document.body.appendChild(agentText);

        agentText.style.position = "fixed";
        agentText.style.inset = "0";
        agentText.style.width = "100vw";
        agentText.style.height = "100vh";
        agentText.style.zIndex = "5";

        agentText.style.display = "flex";
        agentText.style.alignItems = "center";
        agentText.style.justifyContent = "center";

        agentText.style.pointerEvents = "none";

        /*
           Keep Hero visually above Agent while Hero
           is still disappearing.
        */

        if (heroSection) {
            heroSection.style.position = "relative";
            heroSection.style.zIndex = "10";
            heroSection.style.backgroundColor = "var(--bg-color)";
        }
    }


    /* =========================================
       AGENT STYLE
    ========================================= */

    function applyAgentStyles(
        opacity,
        y,
        scale,
        blur
    ) {

        if (!agentText) {
            return;
        }

        lastAgentOpacity = writeAgentVar(
            "--agent-opacity",
            opacity.toFixed(3),
            lastAgentOpacity
        );

        lastAgentY = writeAgentVar(
            "--agent-y",
            y.toFixed(2) + "px",
            lastAgentY
        );

        lastAgentScale = writeAgentVar(
            "--agent-scale",
            scale.toFixed(3),
            lastAgentScale
        );

        lastAgentBlur = writeAgentVar(
            "--agent-blur",
            blur.toFixed(2) + "px",
            lastAgentBlur
        );

        agentText.style.opacity =
            opacity.toFixed(3);

        agentText.style.transform =
            "translate3d(0, " +
            y.toFixed(2) +
            "px, 0) scale(" +
            scale.toFixed(3) +
            ")";

        agentText.style.filter =
            "blur(" +
            blur.toFixed(2) +
            "px)";
    }


    function writeAgentVar(name, value, last) {

        if (value === last) {
            return last;
        }

        agentText.style.setProperty(name, value);

        return value;
    }


    /* =========================================
       MEASURE
    ========================================= */

    function measure() {

        viewportHeight =
            window.innerHeight ||
            document.documentElement.clientHeight;

        listMaxScroll = Math.max(
            0,
            list.scrollHeight - list.clientHeight
        );


        /*
           Lock the scroll distance on first real layout.
        */

        if (
            !metricsReady &&
            viewportHeight > 0 &&
            list.clientHeight > 0
        ) {

            legacyDistance =
                viewportHeight * 2.8;

            listStart =
                legacyDistance * listRevealAt;

            const first =
                serviceItems[0];

            const second =
                serviceItems[1];

            listFirstStep = Math.min(
                listMaxScroll,
                (first && second)
                    ? Math.max(
                        80,
                        second.offsetTop -
                        first.offsetTop
                    )
                    : (
                        first
                            ? first.offsetHeight + 24
                            : 140
                    )
            );


            listIntro =
                viewportHeight * 0.8;

            const restDistance =
                Math.max(
                    listMaxScroll -
                    listFirstStep,
                    0
                );

            const introSpeed =
                listFirstStep /
                Math.max(listIntro, 1);

            const restTravel =
                restDistance /
                Math.max(
                    introSpeed,
                    0.001
                );

            listTravel =
                listIntro +
                restTravel;

            listRunway =
                listTravel;


            scrollSpace.style.height =
                Math.round(
                    listStart +
                    listRunway +
                    viewportHeight
                ) + "px";


            metricsReady = true;
        }


        const rect =
            scrollSpace.getBoundingClientRect();

        spaceTop =
            rect.top +
            window.pageYOffset;

        spaceHeight =
            scrollSpace.offsetHeight;
    }


    /* =========================================
       REVEAL SERVICES
    ========================================= */

    function revealServices(progress) {

        if (listRevealed) {
            return;
        }

        listRevealed = true;

        list.scrollTop = 0;

        listScrollCurrent = 0;

        lastListTop = 0;

        listTrack.style.translate = "0 0";

        listOrigin =
            Math.max(
                0.74,
                progress
            );

        listSpan =
            Math.max(
                1 - listOrigin,
                0.001
            );

        listScrollArmed = false;

        lastListProgress =
            progress;

        listUnlockAt = 0;

        viewport.classList.add(
            "is-list-phase"
        );

        list.classList.add(
            "is-revealed"
        );


        requestAnimationFrame(function () {

            serviceItems.forEach(
                function (item) {
                    item.classList.add(
                        "is-visible"
                    );
                }
            );

            listMaxScroll =
                Math.max(
                    listMaxScroll,
                    list.scrollHeight -
                    list.clientHeight
                );

            syncFromScroll();
        });
    }


    /* =========================================
       RESET
    ========================================= */

    function resetSequence() {

        if (!listRevealed) {
            return;
        }

        listRevealed = false;

        listUnlockAt = 0;

        listScrollCurrent = 0;

        lastListTop = 0;

        listOrigin = 0.74;

        listSpan = 0.26;

        listScrollArmed = false;

        lastListProgress = 0;

        viewport.classList.remove(
            "is-list-phase"
        );

        list.classList.remove(
            "is-revealed"
        );

        list.scrollTop = 0;

        listTrack.style.translate =
            "0 0";


        serviceItems.forEach(
            function (item) {

                item.classList.remove(
                    "is-visible",
                    "is-settled"
                );

            }
        );
    }


    /* =========================================
       WRITE VIEWPORT VARIABLE
    ========================================= */

    function writeVar(
        name,
        value,
        last
    ) {

        if (value === last) {
            return last;
        }

        viewport.style.setProperty(
            name,
            value
        );

        return value;
    }


    /* =========================================
       APPLY EXISTING QUOTE / HEADING STYLES
    ========================================= */

    function applyStyles(
        quoteOpacity,
        quoteY,
        quoteScale,
        decorOpacity,
        headingOpacity,
        headingY
    ) {

        lastQuoteOpacity =
            writeVar(
                "--quote-opacity",
                quoteOpacity.toFixed(3),
                lastQuoteOpacity
            );

        lastQuoteY =
            writeVar(
                "--quote-y",
                quoteY.toFixed(2) + "px",
                lastQuoteY
            );

        lastQuoteScale =
            writeVar(
                "--quote-scale",
                quoteScale.toFixed(3),
                lastQuoteScale
            );

        lastDecorOpacity =
            writeVar(
                "--decor-opacity",
                decorOpacity.toFixed(3),
                lastDecorOpacity
            );

        lastHeadingOpacity =
            writeVar(
                "--heading-opacity",
                headingOpacity.toFixed(3),
                lastHeadingOpacity
            );

        lastHeadingY =
            writeVar(
                "--heading-y",
                headingY.toFixed(2) + "px",
                lastHeadingY
            );
    }


    /* =========================================
       LIST SCROLL
    ========================================= */

    function updateListScroll(scrolled) {

        const intoList =
            clamp(
                scrolled - listStart,
                0,
                listTravel
            );

        let nextTop;


        if (intoList <= listIntro) {

            nextTop =
                listFirstStep *
                (
                    intoList /
                    Math.max(
                        listIntro,
                        1
                    )
                );

        } else {

            const rest =
                (
                    intoList -
                    listIntro
                ) /
                Math.max(
                    listTravel -
                    listIntro,
                    1
                );

            nextTop =
                listFirstStep +
                (
                    listMaxScroll -
                    listFirstStep
                ) *
                rest;
        }


        nextTop =
            clamp(
                nextTop,
                0,
                listMaxScroll
            );


        listScrollCurrent =
            nextTop;


        if (
            Math.abs(
                nextTop -
                lastListTop
            ) < 0.25
        ) {
            return;
        }


        lastListTop =
            nextTop;

        listTrack.style.translate =
            "0 " +
            (-nextTop).toFixed(2) +
            "px";
    }


    /* =========================================
       SYNC
    ========================================= */

    function syncFromScroll() {

        const scrollable =
            spaceHeight -
            viewportHeight;


        if (scrollable <= 0) {
            return;
        }


        const scrolled =
            clamp(
                window.pageYOffset -
                spaceTop,
                0,
                scrollable
            );


        const progress =
            clamp(
                scrolled /
                legacyDistance,
                0,
                1
            );


        if (
            scrolled <= 0 ||
            (
                listRevealed &&
                progress < 0.5
            )
        ) {

            resetSequence();

        } else if (
            progress >=
            listRevealAt
        ) {

            revealServices(
                progress
            );
        }


        if (listRevealed) {
            updateListScroll(
                scrolled
            );
        }
    }


    /* =========================================
       MAIN SCROLL UPDATE
    ========================================= */

    function updateServicesScroll() {

        const scrollable =
            spaceHeight -
            viewportHeight;


        if (scrollable <= 0) {

            measure();

            running = false;

            return;
        }


        const scrolled =
            clamp(
                window.pageYOffset -
                spaceTop,
                0,
                scrollable
            );


        const progress =
            clamp(
                scrolled /
                legacyDistance,
                0,
                1
            );


        syncFromScroll();


        /* =====================================
           HERO → AGENT
        ===================================== */

        const heroProgress =
            getHeroProgress();


        /*
           Agent begins ONLY after Hero reaches 50%.
           50% → 100%.
        */

        let agentEntrance =
            clamp(
                (
                    heroProgress -
                    0.50
                ) / 0.50,
                0,
                1
            );


        agentEntrance =
            easeOutCubic(
                agentEntrance
            );


        /*
           Initial Agent appearance:
           bottom → center
           blur → sharp
           dim → bright
        */

        let agentOpacityTo =
            agentEntrance;

        let agentYTo =
            lerp(
                90,
                0,
                agentEntrance
            );

        let agentScaleTo =
            lerp(
                0.72,
                1,
                agentEntrance
            );

        let agentBlurTo =
            lerp(
                18,
                0,
                agentEntrance
            );


        /* =====================================
           AGENT → QUOTE HANDOFF
        ===================================== */

        /*
           IMPORTANT:

           The Agent does NOT suddenly disappear.

           It gradually moves upward and fades.

           At the SAME time the existing Quote
           becomes visible.

           This removes the empty background gap.
        */


        const agentExit =
            easeInOutCubic(
                clamp(
                    (
                        progress -
                        0.025
                    ) / 0.175,
                    0,
                    1
                )
            );


        /*
           Only start the exit after Hero has
           completely finished.
        */

        if (heroProgress >= 0.999) {

            /*
               Agent slowly moves upward.
            */

            agentYTo +=
                lerp(
                    0,
                    -55,
                    agentExit
                );


            /*
               Agent slowly becomes smaller.
            */

            agentScaleTo *=
                lerp(
                    1,
                    0.76,
                    agentExit
                );


            /*
               Agent slowly becomes blurred.
            */

            agentBlurTo +=
                lerp(
                    0,
                    14,
                    agentExit
                );


            /*
               Agent gradually fades.
            */

            agentOpacityTo *=
                (
                    1 -
                    agentExit
                );
        }


        /*
           Final safety.
        */

        if (progress >= 0.20) {

            /*
               Do NOT instantly kill the Agent at
               the beginning of Quote.

               Let the calculated fade finish.
            */

            if (progress >= 0.21) {

                agentOpacityTo =
                    Math.min(
                        agentOpacityTo,
                        0.03
                    );

            }
        }


        /* =====================================
           EXISTING QUOTE

           Existing Quote timing is retained.
           The Agent fade now overlaps it.
        ===================================== */

        const quoteIn =
            easeOutCubic(
                clamp(
                    (
                        progress -
                        0.20
                    ) / 0.12,
                    0,
                    1
                )
            );


        const quoteOut =
            easeInOutCubic(
                clamp(
                    (
                        progress -
                        0.42
                    ) / 0.11,
                    0,
                    1
                )
            );


        const quoteOpacityTo =
            navJumping
                ? 0
                : quoteIn *
                  (
                      1 -
                      quoteOut
                  );


        const quoteYTo =
            lerp(
                50,
                0,
                quoteIn
            ) +
            lerp(
                0,
                -40,
                quoteOut
            );


        const quoteScaleTo =
            lerp(
                0.88,
                1,
                quoteIn
            ) *
            lerp(
                1,
                0.96,
                quoteOut
            );


        /* =====================================
           EXISTING HEADING
        ===================================== */

        const headingIn =
            easeOutCubic(
                clamp(
                    (
                        progress -
                        0.42
                    ) / 0.11,
                    0,
                    1
                )
            );


        const headingOpacityTo =
            headingIn;


        const headingYTo =
            lerp(
                40,
                0,
                headingIn
            );


        const decorOpacityTo =
            0.55 *
            (
                1 -
                quoteOut
            );


        /* =====================================
           SMOOTHING
        ===================================== */

        const smooth = 0.30;


        quoteOpacityCur =
            approach(
                quoteOpacityCur,
                quoteOpacityTo,
                smooth
            );


        quoteYCur =
            approach(
                quoteYCur,
                quoteYTo,
                smooth
            );


        quoteScaleCur =
            approach(
                quoteScaleCur,
                quoteScaleTo,
                smooth
            );


        decorOpacityCur =
            approach(
                decorOpacityCur,
                decorOpacityTo,
                smooth
            );


        headingOpacityCur =
            approach(
                headingOpacityCur,
                headingOpacityTo,
                smooth
            );


        headingYCur =
            approach(
                headingYCur,
                headingYTo,
                smooth
            );


        /* =====================================
           AGENT SMOOTHING
        ===================================== */

        agentOpacityCur =
            approach(
                agentOpacityCur,
                agentOpacityTo,
                smooth
            );


        agentYCur =
            approach(
                agentYCur,
                agentYTo,
                smooth
            );


        agentScaleCur =
            approach(
                agentScaleCur,
                agentScaleTo,
                smooth
            );


        agentBlurCur =
            approach(
                agentBlurCur,
                agentBlurTo,
                smooth
            );


        /* =====================================
           WRITE EXISTING STYLES
        ===================================== */

        applyStyles(
            quoteOpacityCur,
            quoteYCur,
            quoteScaleCur,
            decorOpacityCur,
            headingOpacityCur,
            headingYCur
        );


        /* =====================================
           WRITE AGENT
        ===================================== */

        if (agentText) {

            applyAgentStyles(
                agentOpacityCur,
                agentYCur,
                agentScaleCur,
                agentBlurCur
            );
        }


        /* =====================================
           CONTINUE RAF
        ===================================== */

        const stillMoving =
            Math.abs(
                quoteOpacityTo -
                quoteOpacityCur
            ) > 0.001 ||

            Math.abs(
                quoteYTo -
                quoteYCur
            ) > 0.02 ||

            Math.abs(
                quoteScaleTo -
                quoteScaleCur
            ) > 0.001 ||

            Math.abs(
                decorOpacityTo -
                decorOpacityCur
            ) > 0.001 ||

            Math.abs(
                headingOpacityTo -
                headingOpacityCur
            ) > 0.001 ||

            Math.abs(
                headingYTo -
                headingYCur
            ) > 0.02 ||

            Math.abs(
                agentOpacityTo -
                agentOpacityCur
            ) > 0.001 ||

            Math.abs(
                agentYTo -
                agentYCur
            ) > 0.02 ||

            Math.abs(
                agentScaleTo -
                agentScaleCur
            ) > 0.001 ||

            Math.abs(
                agentBlurTo -
                agentBlurCur
            ) > 0.02;


        if (stillMoving) {

            requestAnimationFrame(
                updateServicesScroll
            );

        } else {

            running = false;
        }
    }


    /* =========================================
       SCROLL
    ========================================= */

    function onScroll() {

        syncFromScroll();


        if (!running) {

            running = true;

            requestAnimationFrame(
                updateServicesScroll
            );
        }
    }


    /* =========================================
       SERVICES LANDING
    ========================================= */

    function getServicesLandingTop() {

        measure();

        return (
            spaceTop +
            listStart +
            viewportHeight * 0.04
        );
    }


    /* =========================================
       HIDE SLOGAN OVERLAY
    ========================================= */

    function hideSloganOverlay() {

        quoteOpacityCur = 0;

        lastQuoteOpacity =
            writeVar(
                "--quote-opacity",
                "0.000",
                lastQuoteOpacity
            );
    }


    /* =========================================
       NAVIGATION LANDING
    ========================================= */

    function settleNavLanding() {

        quoteOpacityCur = 0;

        quoteYCur = -40;

        quoteScaleCur = 0.96;

        decorOpacityCur = 0;

        headingOpacityCur = 1;

        headingYCur = 0;


        applyStyles(
            0,
            -40,
            0.96,
            0,
            1,
            0
        );


        measure();


        const scrollable =
            Math.max(
                1,
                spaceHeight -
                viewportHeight
            );


        const progress =
            clamp(
                (
                    window.pageYOffset -
                    spaceTop
                ) / scrollable,
                0,
                1
            );


        if (!listRevealed) {

            revealServices(
                Math.max(
                    progress,
                    0.72
                )
            );
        }


        running = true;

        updateServicesScroll();
    }


    /* =========================================
       WATCH NAVIGATION
    ========================================= */

    function watchNavJump() {

        if (navWatching) {
            return;
        }

        navWatching = true;

        const started =
            performance.now();


        function tick() {

            const arrived =
                Math.abs(
                    window.pageYOffset -
                    navJumpTarget
                ) <= 4;


            const timedOut =
                performance.now() -
                started >
                1800;


            if (
                arrived ||
                timedOut
            ) {

                navJumping = false;

                navWatching = false;

                settleNavLanding();

                return;
            }


            requestAnimationFrame(
                tick
            );
        }


        requestAnimationFrame(
            tick
        );
    }


    /* =========================================
       JUMP TO SERVICES
    ========================================= */

    function jumpToOurServices(event) {

        event.preventDefault();


        navJumpTarget =
            getServicesLandingTop();


        navJumping = true;


        hideSloganOverlay();


        window.scrollTo({
            top: navJumpTarget,
            behavior: "smooth"
        });


        watchNavJump();

        onScroll();
    }


    /* =========================================
       INIT
    ========================================= */

    function init() {

        prepareAgentLayer();


        while (list.firstChild) {

            listTrack.appendChild(
                list.firstChild
            );
        }


        listTrack.style.willChange =
            "translate";

        listTrack.style.paddingBottom =
            "3px";


        list.appendChild(
            listTrack
        );


        measure();


        running = true;


        updateServicesScroll();


        window.addEventListener(
            "scroll",
            onScroll,
            { passive: true }
        );


        window.addEventListener(
            "resize",
            function () {

                listMaxScroll =
                    Math.max(
                        0,
                        list.scrollHeight -
                        list.clientHeight
                    );


                const rect =
                    scrollSpace.getBoundingClientRect();


                spaceTop =
                    rect.top +
                    window.pageYOffset;


                spaceHeight =
                    scrollSpace.offsetHeight;


                viewportHeight =
                    window.innerHeight ||
                    document.documentElement.clientHeight;


                onScroll();

            },
            { passive: true }
        );


        window.addEventListener(
            "load",
            function () {

                if (!listRevealed) {
                    metricsReady = false;
                }


                measure();

                onScroll();

            }
        );


        document
            .querySelectorAll(
                'a[href="#our-services"]'
            )
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        jumpToOurServices
                    );

                }
            );
    }


    /* =========================================
       START
    ========================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();