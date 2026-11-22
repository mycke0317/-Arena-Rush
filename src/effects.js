
import * as THREE from 'three';

export function createExplosion(scene, position, color = 0xffaa33) {
  const particles = [];
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true
  });

  for (let i = 0; i < 12; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      material.clone()
    );

    particle.position.copy(position);

    const angle = (i / 12) * Math.PI * 2;

    particle.userData.velocity = new THREE.Vector3(
      Math.cos(angle) * 0.08,
      Math.random() * 0.08,
      Math.sin(angle) * 0.08
    );

    scene.add(particle);
    particles.push(particle);
  }

  let life = 30;

  function update() {
    life--;

    particles.forEach(particle => {
      particle.position.add(particle.userData.velocity);
      particle.material.opacity = Math.max(0, life / 30);
    });

    if (life <= 0) {
      particles.forEach(particle => {
        scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
      });

      return false;
    }

    return true;
  }

  return update;
}
