import * as express from 'express';
import { spawn } from 'child_process';
import * as path from 'path';

const app = express();

let data = [];

interface position {
  x: number;
  y: number;
  z: number;
}

interface Skeleton {
  id: number;
  head: position;
  neck: position;
  left_shoulder: position;
  right_shoulder: position;
  left_elbow: position;
  right_elbow: position;
  left_hand: position;
  right_hand: position;
  torso: position;
  left_hip: position;
  right_hip: position;
  left_knee: position;
  right_knee: position;
  left_foot: position;
  right_foot: position;
}

function stringToSkeleton(str:string) {
  let skeleton = {};
  str.split(',').forEach(s => {
    if (s.startsWith('id')) {
      let [_, id] = s.split(' ');
      skeleton['id'] = Number(id);
    } else {
      let [name, x, y, z] = s.split(' ');
      skeleton[name] = { x: Number(x), y: Number(y), z: Number(z)}
    }
  })
  return <Skeleton>skeleton;
}

app.get('/data', (req, res) => {
  res.send({ data });
})

app.get('**', (req, res) => {
  res.send('Welcome to EOH 2018 web server');
})

const process = spawn(path.join(__dirname, 'KinectTest'), [], { stdio: "pipe" });
process.stdout.on('data', (d) => {
  d.toString().split('\n').map(d => d.trim()).filter(d => d != '').forEach(d => {
    if (d.startsWith('skeletons:')) {
      data = d.substr(10).split(';').filter(d => d != '').map(stringToSkeleton);
    }
  })
})

process.stderr.on('data', (d) => {
  // console.log(d.toString());
})

process.on('close', (code) => {
  console.log(`child process closed with ${code}`);
})

const port = 3000;

app.listen(port, () => {
  console.log(`Listen on ${port}`);
})
