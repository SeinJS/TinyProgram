# Chapter-7：粒子系统

玩家操纵飞船收集到星星之后，星星立刻消隐，这样的效果显然不够好看。在不少游戏中，一些华丽的特效，都会采用粒子系统生成。在这里，我们给星星的消失加上一点点特效，在飞船撞击到星星之后，炸开一堆星星碎片，然后星星消隐，充实游戏观感体验。

## 粒子系统

- step1：安装

```
npm i seinjs-gpu-particle-system
```

- step2：创建美术资源

这里可以用Photoshop设置透明的背景色，设置画布大小最好是128像素*128像素，在其上绘制你的粒子造型。这里，我绘制了一颗橙色的五角星，并将这张图片导出为``point.png``，存储在``src/assets/img``文件夹下。

![point-particle](./img/point.png)

- step3：引入粒子系统，在星星碰撞点生成。在判断碰撞的回调函数中，找到受到碰撞的星星的位置，设置粒子系统的``transform``中的``position``属性为星星的位置，并且设置好粒子系统的旋转角度，让它看起来比较自然。粒子系统中的参数含义和unity中粒子系统的参数含义比较相似，在这里根据需求进行设置。

```
/* StarActor.ts */
private handleCollision = (args) => {
    const game = this.getGame();
    const world = this.getWorld();

    if(args.otherActor.isSpaceshipActor && args.selfActor.visible) {
        console.log('Collision With Spaceship!');
        this.visible = false;

        // 捕获一颗星星
        this.getGame<GameState>().state.starNum ++;
        game.event.trigger(GlobalEvent.GetStar);

        // 产生星云
        const particleStarCloud = world.addActor('particleSystem', Sein.GPUParticleSystem.Actor, {
            emitter: new Sein.GPUParticleSystem.SphereEmitter({
                radius: 0.1
            }),
            count: 1000,
            maxLifeTime: 2.5,
            minLifeTime: 1.5,
            updateSpeed: .01,
            maxVelocity: 1.5,
            minVelocity: 0.5,
            texture: game.resource.get<'Texture'>('point'),
            maxSize: 20,
            minSize: 10,
            maxAcceleration: 0
        });
        particleStarCloud.transform.rotationZ = 45;
        particleStarCloud.transform.position = args.selfActor.transform.position;
        setInterval(() => {
            particleStarCloud.stop();
            particleStarCloud.visible = false;
            world.removeActor(particleStarCloud);
        },1000);
    }
}
```

- step4：注意，对于每个星星，它们在接受碰撞的时候，都会产生一个粒子系统模拟星云的效果，在星云的效果使用完毕后，记得销毁它。

这样，当我们的飞船收集到星星的时候，就会产生一片星云了！

## 潜在的踩坑点

N/A

## 章节成果展示

![fruit-show-7-0](./img/chapter7-0.gif)

## 章节代码参考

// TODO
// StarActor.ts