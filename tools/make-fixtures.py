"""Generate original, tiny GLB fixtures with stdlib only. No production art claims."""
from pathlib import Path
import json, struct

out = Path(__file__).resolve().parents[1] / 'assets' / 'test'
out.mkdir(parents=True, exist_ok=True)

def fixture(is_set=False, boss=False):
    data = bytearray()
    views, accessors = [], []
    def accessor(values, fmt, component, shape, minimum=None, maximum=None):
        while len(data) % 4: data.append(0)
        offset = len(data)
        data.extend(struct.pack('<' + fmt * len(values), *values))
        views.append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(data)-offset})
        sizes = {'SCALAR': 1, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
        a = {'bufferView': len(views)-1, 'componentType': component, 'count': len(values)//sizes[shape], 'type': shape}
        if minimum is not None: a['min'] = minimum; a['max'] = maximum
        accessors.append(a)
        return len(accessors)-1
    vertices = [-.5,-.5,-.5,.5,-.5,-.5,.5,.5,-.5,-.5,.5,-.5,-.5,-.5,.5,.5,-.5,.5,.5,.5,.5,-.5,.5,.5]
    pos = accessor(vertices, 'f', 5126, 'VEC3', [-.5]*3,[.5]*3)
    idx = accessor([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,2,3,7,2,7,6,1,2,6,1,6,5,3,0,4,3,4,7], 'H', 5123, 'SCALAR')
    joints = accessor([0,0,0,0]*8, 'H', 5123, 'VEC4')
    weights = accessor([1,0,0,0]*8, 'f', 5126, 'VEC4')
    bind = accessor([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1], 'f', 5126, 'MAT4')
    times = accessor([0,.5,1], 'f', 5126, 'SCALAR',[0],[1])
    translation = accessor([0,0,0,0,.05,0,0,0,0], 'f', 5126, 'VEC3')
    materials = [{'name': n, 'pbrMetallicRoughness': {'baseColorFactor': c, 'metallicFactor': 0,'roughnessFactor':1}, 'extensions':{'KHR_materials_unlit':{}}} for n,c in [('body',[.043,.043,.051,1]),('mask',[.945,.925,.886,1]),('eyes',[1,.54,.24,1]),('palms',[1,.54,.24,1]),('forest',[.35,.65,.35,1])]]
    for material in materials:
        if material['name'] in ('eyes', 'palms'):
            del material['extensions']
            material['emissiveFactor'] = [1, .54, .24]
    nodes = [{'name':'fixture','children':[1]},{'name':'body-bone'}]
    meshes=[]
    def mesh(name, material, position, scale, skin=False):
        factor = 3 if boss else 1
        attrs={'POSITION':pos}
        if skin:
            # Skin vertices live in bind space; a mesh-node scale is not a rig bake.
            baked = [(value*scale[i%3]+position[i%3])*factor for i,value in enumerate(vertices)]
            bounds = [[min(baked[axis::3]),max(baked[axis::3])] for axis in range(3)]
            attrs.update(POSITION=accessor(baked,'f',5126,'VEC3',[b[0] for b in bounds],[b[1] for b in bounds]),JOINTS_0=joints,WEIGHTS_0=weights)
        meshes.append({'name':name,'primitives':[{'attributes':attrs,'indices':idx,'material':material}]})
        node={'name':name,'mesh':len(meshes)-1,'translation':[0,0,0] if skin else [v*factor for v in position],'scale':[1,1,1] if skin else [v*factor for v in scale]}
        if skin: node['skin']=0
        nodes[0]['children'].append(len(nodes));nodes.append(node)
    if is_set:
        for name,scale in [('ground-1',[1,1,2]),('ground-2',[2,1,2]),('ground-4',[4,1,2]),('platform',[1,.2,1]),('slope',[1,1,1]),('breakable-wall',[1,1,1]),('altar',[.8,1,1]),('crater',[2,.2,2]),('tree-1',[.5,5,.5]),('tree-2',[1,7,1]),('fern',[.6,.6,.4]),('root',[2,.5,.5]),('mushroom',[.5,.5,.5]),('vine',[.1,3,.1]),('background-1',[60,20,.1]),('background-2',[60,10,.1]),('background-3',[60,5,.1])]:mesh(name,4,[0,scale[1]/2,0],scale)
    else:
        mesh('body',0,[0,.7,0],[.6,1,.35],True)
        mesh('mask',1,[.1,1.4,.23],[.65,.55,.15])
        mesh('eyes',2,[.1,1.45,.34],[.4,.1,.05])
        mesh('palms',3,[.45,.65,.15],[.12,.12,.12])
        for i in range(4):mesh('wing'+str(i),0,[(-1 if i<2 else 1)*.5,.9+(i%2)*.35,-.1],[.65,.17,.08])
        for i in range(1,4):mesh('crack'+str(i),0,[.1+(i-2)*.13,1.4,.32],[.025,.45,.025])
        for i in range(1,9):mesh('shard'+str(i),1,[.1,1.4,.25],[.12,.12,.04])
        mesh('halfmask',1,[.1,1.4,.24],[.32,.55,.15])
    clips=['idle','run','jump','doublejump','glide','punch1','punch2','punch3','kick','divekick','sword','downsword','blast','charge','dodge','hit','maskbreak','glassidle','beaten','block','parry','move','telegraph','attack','slam','sweep','barrage','summon','rush','lunge']
    gltf={'asset':{'version':'2.0','generator':'Glasswing original test fixture'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,'meshes':meshes,'materials':materials,'extensionsUsed':['KHR_materials_unlit'],'buffers':[{'byteLength':len(data)}],'bufferViews':views,'accessors':accessors,'skins':[{'joints':[1],'skeleton':1,'inverseBindMatrices':bind}],'animations':[] if is_set else [{'name':name,'samplers':[{'input':times,'output':translation,'interpolation':'LINEAR'}],'channels':[{'sampler':0,'target':{'node':1,'path':'translation'}}]} for name in clips]}
    encoded=json.dumps(gltf,separators=(',',':')).encode()
    encoded+=b' '*(-len(encoded)%4);data+=b'\0'*(-len(data)%4)
    size=12+8+len(encoded)+8+len(data)
    result=struct.pack('<III',0x46546c67,2,size)+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(data),0x004e4942)+data
    (out/('dummy-set.glb' if is_set else 'dummy-boss.glb' if boss else 'dummy-character.glb')).write_bytes(result)

fixture();fixture(True);fixture(boss=True)
print('Generated original character/animation/skin/material and named-set GLB fixtures.')
