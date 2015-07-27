/// <reference path="kube3dHelpers.ts"/>

module Kube3d {

  export class Podlek {
    public deleted = false;
    public hit = false;
    private _entity:any = undefined;
    private _clearInterval:() => void = undefined;
    private log:Logging.Logger = undefined;

    public constructor(private model, private game, private _name:string, private _pod:any) {
      this.log = Logger.get('podlek-' + _name);

    }

    private createMesh() {
      var game = this.game;
      var THREE = game.THREE;
      var boxTexture = THREE.ImageUtils.loadTexture(this._pod.$iconUrl);
      boxTexture.minFilter = THREE.NearestFilter;
      var boxMaterial = new THREE.MeshPhongMaterial({
        map: boxTexture,
        alphaMap: boxTexture
      });
      var box = new THREE.Mesh(new THREE.CubeGeometry(game.cubeSize, game.cubeSize, game.cubeSize), boxMaterial);
      return box;
    }

    public destroy() {
      if (this.entity) {
        this.game.removeItem(this.entity);
      }
      if (this.clearInterval) {
        this.clearInterval();
      }
    }

    public tick(delta) {
      if (this.hit && this.inGame()) {
        this.entity.mesh.scale.x = this.entity.mesh.scale.x + 0.05;
        this.entity.mesh.scale.z = this.entity.mesh.scale.z + 0.05;
      }
    }

    public die() {
      this.model['podsResource'].delete({ id: Kubernetes.getName(this.pod) });
      this.deleted = true;
      if (this.clearInterval) {
        this.clearInterval();
        delete this.clearInterval;
      }
      this.entity.velocity.y = 2;
      this.entity.resting = false;
      log.debug("Creature hit: ", this);
    }

    public spawn(player) {
      var mesh = this.createMesh();
      mesh.name = this._name;
      var playerX = player.position.x;
      var playerZ = player.position.z;
      var distX = Math.random() * 30 + 10;
      var distZ = Math.random() * 30 + 10;
      distX = maybe() ? distX : distX * -1;
      distZ = maybe() ? distZ : distZ * -1;
      var x = playerX + distX;
      var z = playerZ + distZ;
      this.log.debug("Spawning at x:", x, " z:", z, " player at x:", playerX, " z:", playerZ);
      mesh.position.set(x, 30, z);
      var item:any = {
        mesh: mesh,
        size: 1,
        velocity: { x: 0, y: 0, z: 0 }
      };
      this.entity = this.game.addItem(item);
      this.clearInterval = this.game.setInterval(() => {
        if (this.deleted) {
          return;
        }
        this.entity.velocity.x = (Math.random() * 10 - 5) * 0.005;
        this.entity.velocity.z = (Math.random() * 10 - 5) * 0.005;
        this.entity.velocity.y = (Math.random() * 10 - 5) * 0.005;
        this.entity.resting = false;
      }, Math.random() * 5000 + 500);
    }

    public inGame() {
      return angular.isDefined(this._entity);
    }

    public get name() {
      return this._name;
    }

    public get pod() {
      return this._pod;
    }

    public set pod(p:any) {
      try {
        angular.copy(p, this._pod);
      } catch (e) {
        // most likely an identical object
      }
    }

    public get clearInterval() {
      return this._clearInterval;
    }

    public set clearInterval(f:() => void) {
      this._clearInterval = f;
    }

    public get entity() {
      return this._entity;
    }

    public set entity(e:any) {
      this._entity = e;
    }

  }

}