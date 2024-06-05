import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
let camera, scene, renderer;
let hiroMarkerMesh, earthNFTMesh;

init();

async function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setAnimationLoop(render);
    renderer.xr.enabled = true;
    const container = document.querySelector("#scene-container");
    container.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set(0.5, 1, 0.25);
    scene.add(ambient);

    const imgMarkerHiro = document.getElementById("imgMarkerHiro");
    const imgMarkerHiroBitmap = await createImageBitmap(imgMarkerHiro);

    const imgNFTEarth = document.getElementById("imgNFTEarth");
    const imgNFTEarthBitmap = await createImageBitmap(imgNFTEarth);

    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["image-tracking"],
        trackedImages: [
            {
                image: imgMarkerHiroBitmap,
                widthInMeters: 0.8,
            },
            {
                image: imgNFTEarthBitmap,
                widthInMeters: 10,
            }
        ],
        optionalFeatures: ["dom-overlay"],
        domOverlay: {
            root: document.body,
        },
    });

    document.body.appendChild(button);

    const hiroMarkerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    hiroMarkerGeometry.translate(0, 0.1, 0);
    const hiroMarkerMaterial = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
    });
    hiroMarkerMesh = new THREE.Mesh(hiroMarkerGeometry, hiroMarkerMaterial);
    hiroMarkerMesh.name = "HiroMarkerCube";
    hiroMarkerMesh.matrixAutoUpdate = false;
    hiroMarkerMesh.visible = false;
    scene.add(hiroMarkerMesh);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/Mart_cc5e06d25b.glb', (gltf) => {
        earthNFTMesh = gltf.scene;

        // Уменьшаем масштаб объекта
        earthNFTMesh.scale.set(0.01, 0.01, 0.01); // Настройте масштаб по необходимости

        earthNFTMesh.traverse(function (child) {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 1;
            }
        });
        earthNFTMesh.matrixAutoUpdate = false;
        earthNFTMesh.visible = false;
        scene.add(earthNFTMesh);
    }, undefined, function (error) {
        console.error(error);
    });

    // const objLoader = new OBJLoader();
    // objLoader.load('/uploads_files_2787791_Mercedes+Benz+GLS+580.obj', (object) => {
    //     earthNFTMesh = object;

    //     // Уменьшаем масштаб объекта
    //     earthNFTMesh.scale.set(0.01, 0.01, 0.01); // Настройте масштаб по необходимости

    //     earthNFTMesh.traverse(function (child) {
    //         if (child.isMesh) {
    //             child.material.transparent = true;
    //             child.material.opacity = 0.7;
    //             child.material.side = THREE.DoubleSide;
    //         }
    //     });
    //     earthNFTMesh.matrixAutoUpdate = false;
    //     earthNFTMesh.visible = false;
    //     scene.add(earthNFTMesh);
    // }, undefined, function (error) {
    //     console.error(error);
    // });

    // const fbxLoader = new FBXLoader();
    // fbxLoader.load('/fbx/ToyCar.FBX', (object) => {
    //     earthNFTMesh = object;

    //     // Уменьшаем масштаб объекта
    //     earthNFTMesh.scale.set(1, 1, 1); // Настройте масштаб по необходимости

    //     earthNFTMesh.traverse(function (child) {
    //         if (child.isMesh) {
    //             child.material.transparent = true;
    //             child.material.opacity = 0.7;
    //             child.material.side = THREE.DoubleSide;
    //         }
    //     });
    //     earthNFTMesh.matrixAutoUpdate = false;
    //     earthNFTMesh.visible = false;
    //     scene.add(earthNFTMesh);
    // }, undefined, function (error) {
    //     console.error(error);
    // });
}

function render(timestamp, frame) {
    if (frame) {
        const results = frame.getImageTrackingResults();
        for (const result of results) {
            const imageIndex = result.index;

            const referenceSpace = renderer.xr.getReferenceSpace();
            const pose = frame.getPose(result.imageSpace, referenceSpace);

            if (result.trackingState === 'tracked') {
                if (imageIndex === 0) {
                    hiroMarkerMesh.visible = true;
                    hiroMarkerMesh.matrix.fromArray(pose.transform.matrix);
                }
                if (imageIndex === 1) {
                    earthNFTMesh.visible = true;
                    earthNFTMesh.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                if (imageIndex === 0) {
                    hiroMarkerMesh.visible = false;
                }
                if (imageIndex === 1) {
                    earthNFTMesh.visible = false;
                }
            }
        }
    }
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('ARButton');
    if (button) {
        button.focus(); // Установка фокуса на кнопку AR при загрузке страницы
    }
});
