const builder = require('electron-builder')
const path = require('path')
console.log(__dirname)
builder.build({
    config: {
        appId: "co.uk.morethanyouknow.lockpick",
        productName: "Lockpick",
        copyright: "More Than You Know Ltd.",
        files: {
            extra: appDir,
            output: "out",
            buildResources: "build-res"
        },
        files: [
            "package.json",
            "dist/**/*",
            "extra-resources",
            "node_modules"
        ],
        dmg: {
            background: null,
            backgroundColor: "#ffffff",
            window: {
                width: "400",
                height: "300"
            },
            contents: [
                {
                    x: 100,
                    y: 100
                },
                {
                    x: 300,
                    y: 100,
                    type: "link",
                    path: "/Applications"
                }
            ]
        },
        build: {
            afterSign: path.join(__dirname, 'notarize.js')
        },
        mac: {
            target: "dmg",
            category: "public.app-category.utilities",

            hardenedRuntime : true,
            gatekeeperAssess: false,
            entitlements: path.join(__dirname, 'entitlements.mac.plist'),
            entitlementsInherit: path.join(__dirname, 'entitlements.mac.plist')
        },
        // win: {
        //     "target": "nsis"
        // }
    }
})