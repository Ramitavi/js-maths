class RunspaceVariable {
  constructor(name, value, desc = undefined, constant = false) {
    this.name = name;
    this.value = value;
    this.desc = desc ?? '[no information]';
    this.constant = constant;
    this.isRef = false; // if true, on __assign__, use rs.setVar not rs.defineVar
  }
  castTo(type) { return this.value.castTo(type); }
  toPrimitive(type) { return this.value.toPrimitive(type); }
  copy() { return new RunspaceVariable(this.name, this.value, this.desc); }
}

module.exports = RunspaceVariable;