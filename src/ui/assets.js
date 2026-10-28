export let manifest={models:{},sets:{},music:{},sounds:{}};
export async function loadManifest(path='./assets/manifest.json'){try{const response=await fetch(path);if(response.ok)manifest=await response.json();}catch{}return manifest;}
