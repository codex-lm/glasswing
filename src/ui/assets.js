export let manifest={models:{},sets:{},music:{},sounds:{}};
export async function loadManifest(){try{const response=await fetch('./assets/manifest.json');if(response.ok)manifest=await response.json();}catch{}return manifest;}
