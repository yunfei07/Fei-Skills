import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import type {Scene, SpatialPoint} from '../../../../shared/scene-graph/types';

const PAPER = '#F4F1E8';
const INK = '#24302B';
const GREEN = '#7F9488';
const CYAN = '#A7B8B1';

function pointColor(index:number) {
  return index % 2 === 0 ? GREEN : CYAN;
}

export function SpatialScene3D({scene}:{scene:Scene}) {
  const frame = useCurrentFrame();
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const points = useMemo(() => ((scene.data?.points as SpatialPoint[]) || []), [scene.data]);
  const camera = (scene.data?.camera || {}) as {position?:[number,number,number]; target?:[number,number,number]; motion?:string};
  const base = camera.position ?? [0,0,6];
  const progress = durationInFrames > 1 ? frame/(durationInFrames-1) : 0;
  const push = camera.motion === 'slow-push' ? interpolate(progress,[0,1],[0,0.7]) : camera.motion === 'slow-pull' ? interpolate(progress,[0,1],[0,-0.7]) : 0;
  const lateral = camera.motion === 'lateral' ? interpolate(progress,[0,1],[-0.45,0.45]) : 0;
  const cameraPosition:[number,number,number] = [base[0]+lateral, base[1], base[2]-push];
  const settle = interpolate(frame,[0,Math.max(1,Math.round(fps*0.7))],[0,1],{extrapolateRight:'clamp'});

  return <ThreeCanvas width={width} height={height} camera={{position:cameraPosition,fov:35}} style={{background:PAPER}}>
    <ambientLight intensity={1.15}/>
    <directionalLight position={[4,6,5]} intensity={1.35}/>
    <group scale={settle}>
      {points.map((p,index)=><mesh key={`${p.x}-${p.y}-${p.z}-${index}`} position={[p.x,p.y,p.z]}>
        <sphereGeometry args={[p.size ?? 0.13,24,24]}/>
        <meshStandardMaterial color={pointColor(index)} roughness={0.92} metalness={0}/>
      </mesh>)}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.45,0]}>
        <planeGeometry args={[6.2,4.4]}/>
        <meshStandardMaterial color={PAPER} roughness={1} metalness={0}/>
      </mesh>
    </group>
  </ThreeCanvas>;
}

export function SpatialFallback({scene}:{scene:Scene}) {
  return <div style={{width:'100%',height:'100%',display:'grid',placeItems:'center',color:INK,fontFamily:'Songti SC, STSong, Noto Serif CJK SC, Georgia, serif'}}>
    <div style={{maxWidth:900,textAlign:'center'}}>
      <div style={{fontSize:52,marginBottom:24}}>空间关系</div>
      <div style={{fontSize:26,lineHeight:1.7,color:'#5F6B65'}}>{scene.data?.meaning as string || scene.fallback}</div>
    </div>
  </div>;
}
