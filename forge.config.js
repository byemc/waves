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
    }
  ],
  publishers: [],
  plugins: [],
};
