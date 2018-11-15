'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * Check if user has assigned a specific permission
 * @param  {RBAC}  rbac Instance of RBAC
 * @param  {String}   action  Name of action
 * @param  {String}   resource  Name of resource
 * @return {Boolean}
 */
var can = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(rbac, action, resource, cb) {
        var _this, permission;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _this = this;
                        _context.next = 3;
                        return rbac.getPermission(action, resource);

                    case 3:
                        permission = _context.sent;

                        if (permission) {
                            _context.next = 6;
                            break;
                        }

                        return _context.abrupt('return', false);

                    case 6:
                        if (!((0, _indexOf2.default)(_this.permissions, permission.name) !== -1)) {
                            _context.next = 8;
                            break;
                        }

                        return _context.abrupt('return', true);

                    case 8:
                        if (_this.role) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt('return', false);

                    case 10:
                        _context.next = 12;
                        return rbac.can(_this.role, action, resource);

                    case 12:
                        return _context.abrupt('return', _context.sent);

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function can(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
}();

/**
 * Assign additional permissions to the user
 * @param  {String|Array}   permissions  Array of permissions or string representing of permission
 * @param  {Function} cb Callback
 */


/**
 * Check if user has assigned a specific role
 * @param  {RBAC}  rbac Instance of RBAC
 * @param  {String}  name Name of role
 * @return {Boolean}      [description]
 */
var hasRole = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(rbac, role) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (this.role) {
                            _context2.next = 2;
                            break;
                        }

                        return _context2.abrupt('return', false);

                    case 2:
                        _context2.next = 4;
                        return rbac.hasRole(this.role, role);

                    case 4:
                        return _context2.abrupt('return', _context2.sent);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function hasRole(_x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

exports.default = hrbacPlugin;

require('babel-polyfill');

var _union = require('lodash/union');

var _union2 = _interopRequireDefault(_union);

var _indexOf = require('lodash/indexOf');

var _indexOf3 = _interopRequireDefault(_indexOf);

var _without = require('lodash/without');

var _without2 = _interopRequireDefault(_without);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function getScope(rbac, cb) {
    var permissions = this.permissions || [];

    rbac.getScope(this.role, function (err, scope) {
        if (err) {
            return cb(err);
        }

        var newScope = (0, _union2.default)(permissions, scope);
        return cb(null, newScope);
    });

    return this;
}function addPermission(rbac, action, resource, cb) {
    var _this2 = this;

    rbac.getPermission(action, resource, function (err, permission) {
        if (err) {
            return cb(err);
        }

        if (!permission) {
            return cb(new Error('Permission not exists'));
        }

        if ((0, _indexOf3.default)(_this2.permissions, permission.name) !== -1) {
            return cb(new Error('Permission is already assigned'));
        }

        _this2.permissions.push(permission.name);
        return _this2.save(function (err2, user) {
            if (err2) {
                return cb(err2);
            }

            if (!user) {
                return cb(new Error('User is undefined'));
            }

            return cb(null, true);
        });
    });

    return this;
}

function removePermission(permissionName, cb) {
    if ((0, _indexOf3.default)(this.permissions, permissionName) === -1) {
        cb(new Error('Permission was not asssigned'));
        return this;
    }

    this.permissions = (0, _without2.default)(this.permissions, permissionName);
    this.save(function (err, user) {
        if (err) {
            return cb(err);
        }

        if (!user) {
            return cb(new Error('User is undefined'));
        }

        if ((0, _indexOf3.default)(user.permissions, permissionName) !== -1) {
            return cb(new Error('Permission was not removed'));
        }

        return cb(null, true);
    });

    return this;
}

function removePermissionFromCollection(permissionName, cb) {
    this.update({ permissions: permissionName }, { $pull: { permissions: permissionName } }, { multi: true }, function (err, num) {
        return err ? cb(err) : cb(null, true);
    });
    return this;
}

function removeRole(cb) {
    if (!this.role) {
        cb(null, false);
        return this;
    }

    this.role = null;
    this.save(function (err, user) {
        if (err) {
            return cb(err);
        }

        if (!user) {
            return cb(new Error('User is undefined'));
        }

        return cb(null, user.role === null);
    });

    return this;
}

function removeRoleFromCollection(roleName, cb) {
    this.update({
        role: roleName
    }, {
        role: null
    }, {
        multi: true
    }, function (err, num) {
        if (err) {
            return cb(err);
        }

        return cb(null, true);
    });

    return this;
}

function setRole(rbac, role, cb) {
    var _this3 = this;

    if (this.role === role) {
        cb(new Error('User already has assigned this role'));
        return this;
    }

    // check existance of permission
    rbac.getRole(role, function (err, role) {
        if (err) {
            return cb(err);
        }

        if (!role) {
            return cb(new Error('Role does not exists'));
        }

        _this3.role = role.name;
        return _this3.save(function (err2, user) {
            if (err2) {
                return cb(err2);
            }

            if (!user) {
                return cb(new Error('User is undefined'));
            }

            return cb(null, user.role === _this3.role);
        });
    });

    return this;
}

function hrbacPlugin(schema) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    schema.add({
        role: {
            type: String,
            default: options.defaultRole
        },
        permissions: {
            type: [String],
            default: options.defaultPermissions
        }
    });

    schema.methods.can = can;

    schema.methods.addPermission = addPermission;
    schema.methods.removePermission = removePermission;

    schema.methods.hasRole = hasRole;
    schema.methods.removeRole = removeRole;
    schema.methods.setRole = setRole;

    schema.methods.getScope = getScope;

    schema.statics.removeRoleFromCollection = removeRoleFromCollection;
    schema.statics.removePermissionFromCollection = removePermissionFromCollection;
}