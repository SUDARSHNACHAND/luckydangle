/**
 * Verlet / Spring-Mass Physics Engine for Lucky Dangle
 * Simulates dangling cords, beads, charm bodies, and mouse interactions.
 */

export class DanglePhysics {
  constructor(options = {}) {
    this.anchorX = options.anchorX || window.innerWidth / 2;
    this.anchorY = options.anchorY || 0;
    this.numSegments = options.numSegments || 6;
    this.segmentLength = options.segmentLength || 32;
    this.gravity = options.gravity || 0.65;
    this.damping = options.damping || 0.96;
    this.stiffness = options.stiffness || 5;

    // Nodes store { x, y, oldX, oldY, pin, mass, radius }
    this.nodes = [];
    this.angle = 0;
    this.angularVelocity = 0;
    
    // Wind noise variables
    this.wind = 0;
    this.time = 0;

    // Dragging state
    this.isDragging = false;
    this.draggedNodeIndex = -1;
    this.dragOffset = { x: 0, y: 0 };
    this.dragVelocity = { x: 0, y: 0 };
    this.lastPointer = { x: 0, y: 0, time: 0 };

    this.reset();
  }

  reset(anchorX = this.anchorX) {
    this.anchorX = anchorX;
    this.nodes = [];
    let currentY = this.anchorY;

    for (let i = 0; i <= this.numSegments; i++) {
      const isAnchor = i === 0;
      const isCharm = i === this.numSegments;
      this.nodes.push({
        x: this.anchorX,
        y: currentY,
        oldX: this.anchorX,
        oldY: currentY,
        pin: isAnchor,
        mass: isCharm ? 2.5 : 1.0,
        radius: isCharm ? 35 : 4
      });
      currentY += this.segmentLength;
    }
  }

  setAnchorX(x) {
    this.anchorX = Math.max(80, Math.min(window.innerWidth - 80, x));
    if (this.nodes[0]) {
      this.nodes[0].x = this.anchorX;
      this.nodes[0].oldX = this.anchorX;
    }
  }

  update() {
    this.time += 0.016;
    // Gentle natural wind impulse
    this.wind = Math.sin(this.time * 1.5) * 0.12 + Math.cos(this.time * 2.7) * 0.08;

    // Verlet position integration
    for (let i = 1; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      if (n.pin) continue;

      const vx = (n.x - n.oldX) * this.damping + this.wind / n.mass;
      const vy = (n.y - n.oldY) * this.damping + (this.gravity * n.mass);

      n.oldX = n.x;
      n.oldY = n.y;

      // If being dragged by mouse, clamp node position to cursor
      if (this.isDragging && i === this.draggedNodeIndex) {
        // Position updated by pointer move handler
      } else {
        n.x += vx;
        n.y += vy;
      }
    }

    // Constraint relaxation iterations (distance constraints)
    for (let iter = 0; iter < this.stiffness; iter++) {
      // Anchor pin constraint
      this.nodes[0].x = this.anchorX;
      this.nodes[0].y = this.anchorY;

      for (let i = 0; i < this.nodes.length - 1; i++) {
        const n1 = this.nodes[i];
        const n2 = this.nodes[i + 1];

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (dist - this.segmentLength) / dist;

        const m1 = n1.pin ? 0 : 1 / n1.mass;
        const m2 = n2.pin ? 0 : 1 / n2.mass;
        const totalM = m1 + m2;
        if (totalM === 0) continue;

        if (!n1.pin) {
          n1.x += dx * diff * (m1 / totalM);
          n1.y += dy * diff * (m1 / totalM);
        }
        if (!n2.pin && !(this.isDragging && i + 1 === this.draggedNodeIndex)) {
          n2.x -= dx * diff * (m2 / totalM);
          n2.y -= dy * diff * (m2 / totalM);
        }
      }
    }

    // Calculate charm body sway angle
    const charmNode = this.getCharmNode();
    const prevNode = this.nodes[this.nodes.length - 2];
    if (charmNode && prevNode) {
      const dx = charmNode.x - prevNode.x;
      const dy = charmNode.y - prevNode.y;
      const targetAngle = Math.atan2(dx, dy); // angle from vertical
      this.angle += (targetAngle - this.angle) * 0.2;
    }
  }

  getCharmNode() {
    return this.nodes[this.nodes.length - 1];
  }

  applyImpulse(fx, fy) {
    const charmNode = this.getCharmNode();
    if (charmNode) {
      charmNode.x += fx;
      charmNode.y += fy;
    }
  }

  startDrag(px, py) {
    const charmNode = this.getCharmNode();
    const dx = px - charmNode.x;
    const dy = py - charmNode.y;
    const dist = Math.hypot(dx, dy);

    if (dist < charmNode.radius + 30) {
      this.isDragging = true;
      this.draggedNodeIndex = this.nodes.length - 1;
      this.dragOffset = { x: dx, y: dy };
      this.lastPointer = { x: px, y: py, time: performance.now() };
      return true;
    }

    // Check intermediate cord nodes and beads along string
    for (let i = this.nodes.length - 2; i >= 1; i--) {
      const node = this.nodes[i];
      const ndx = px - node.x;
      const ndy = py - node.y;
      if (Math.hypot(ndx, ndy) < 22) {
        this.isDragging = true;
        this.draggedNodeIndex = i;
        this.dragOffset = { x: ndx, y: ndy };
        this.lastPointer = { x: px, y: py, time: performance.now() };
        return true;
      }
    }

    // Check string top anchor bar drag
    if (py < 40 && Math.abs(px - this.anchorX) < 60) {
      this.isDraggingTop = true;
      return true;
    }

    return false;
  }

  drag(px, py) {
    const now = performance.now();
    const dt = (now - this.lastPointer.time) / 1000 || 0.016;

    if (this.isDragging && this.draggedNodeIndex >= 0) {
      const node = this.nodes[this.draggedNodeIndex];
      const targetX = px - this.dragOffset.x;
      const targetY = py - this.dragOffset.y;

      this.dragVelocity.x = (targetX - node.x) / dt;
      this.dragVelocity.y = (targetY - node.y) / dt;

      node.x = targetX;
      node.y = targetY;

      this.lastPointer = { x: px, y: py, time: now };
    } else if (this.isDraggingTop) {
      this.setAnchorX(px);
    }
  }

  endDrag() {
    if (this.isDragging && this.draggedNodeIndex >= 0) {
      const node = this.nodes[this.draggedNodeIndex];
      // Apply release momentum (flick impulse)
      const flickX = Math.max(-80, Math.min(80, this.dragVelocity.x * 0.05));
      const flickY = Math.max(-50, Math.min(50, this.dragVelocity.y * 0.05));

      node.oldX = node.x - flickX;
      node.oldY = node.y - flickY;
    }

    this.isDragging = false;
    this.isDraggingTop = false;
    this.draggedNodeIndex = -1;
  }
}
