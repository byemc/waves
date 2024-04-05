module.exports = {
  packagerConfig: { /* ... */ },
  rebuildConfig: { /* ... */ },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {}
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux', 'win32'],
    },
    {
      "name": "@electron-forge/maker-deb",
      "config": {}
    },
    {
      "name": "@electron-forge/maker-rpm",
      "config": {}
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'byemc',
          name: 'waves'
        },
        prerelease: true,
        draft: false
      }
    }
  ],
  plugins: [
  ],
};
