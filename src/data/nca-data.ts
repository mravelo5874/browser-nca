import * as vox_data from './all'

export const NCAmodels: string[] = [
    'oak',
    'rubiks',
    'sphere',
    'burger',
    'cowboy',
    'earth',
    'cactus',
    'maze',
    'minicube'
]

export const oak_data = {
    'model': 'oak_aniso_single',
    'size': 32,
    'seed': new Float32Array(vox_data.oak_seed)
}

export const sphere_data = {
    'model': 'sphere16_iso3_thesis',
    'size': 24,
    'seed': new Float32Array(vox_data.sphere_seed)
}

export const rubiks_data = {
    'model': 'rubiks_black_cube_iso3_v3',
    'size': 25,
    'seed': new Float32Array(vox_data.rubiks_seed)
}

export const burger_data = {
    'model': 'burger_aniso',
    'size': 24,
    'seed': new Float32Array(vox_data.burger_seed)
}

export const cowboy_data = {
    'model': 'cowboy16_iso2_v13',
    'size': 24,
    'seed': new Float32Array(vox_data.cowboy_seed)
}

export const earth_data = {
    'model': 'earth_aniso_single',
    'size': 32,
    'seed': new Float32Array(vox_data.earth_seed)
}

export const cactus_data = {
    'model': 'cactus_iso3_v1',
    'size': 33,
    'seed': new Float32Array(vox_data.cactus_seed)
}

export const maze_data = {
    'model': 'maze25_aniso_nodmg',
    'size': 33,
    'seed': new Float32Array(vox_data.maze_seed)
}

export const minicube_data = {
    'model': 'minicube5_aniso_v0',
    'size': 9,
    'seed': new Float32Array(vox_data.minicube_seed)
}