//
// This file is part of Canvas.
// Copyright (C) 2020-present  Instructure, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import UIKit

@IBDesignable
public class CircleProgressView: UIView {
    let track = CAShapeLayer()
    let fill = CAShapeLayer()
    let morph = CAAnimationGroup()
    let morphKey = "morph"
    let rotate = CABasicAnimation(keyPath: "transform.rotation.z")
    let rotateKey = "rotate"

    public override var bounds: CGRect {
        didSet { updateSize() }
    }

    @IBInspectable
    public var color: UIColor = Brand.shared.primary.ensureContrast(against: .named(.backgroundLightest)) {
        didSet { fill.strokeColor = color.cgColor }
    }

    public var progress: CGFloat? = nil {
        didSet { updateProgress() }
    }

    @IBInspectable
    var thickness: CGFloat = 3 {
        didSet { updateSize() }
    }

    public override init(frame: CGRect) {
        super.init(frame: frame)
        commonInit()
    }

    public required init?(coder: NSCoder) {
        super.init(coder: coder)
        commonInit()
    }

    func updateSize() {
        track.lineWidth = thickness
        track.path = ring(thickness)
        fill.lineWidth = thickness
        fill.path = ring(thickness)
        fill.frame = bounds
    }

    func updateProgress() {
        if let progress = progress {
            fill.removeAnimation(forKey: morphKey)
            layer.removeAnimation(forKey: rotateKey)
            fill.strokeEnd = progress
        } else {
            fill.add(morph, forKey: morphKey)
            layer.add(rotate, forKey: rotateKey)
        }
    }

    func commonInit() {
        track.fillColor = UIColor.clear.cgColor
        track.strokeColor = UIColor.named(.borderLight).cgColor
        layer.addSublayer(track)

        fill.fillColor = UIColor.clear.cgColor
        fill.strokeColor = color.cgColor
        fill.strokeEnd = 0.1
        layer.addSublayer(fill)

        let ease = CAMediaTimingFunction(controlPoints: 0.25, 0.1, 0.25, 1.0)

        let strokeEnd = CAKeyframeAnimation(keyPath: #keyPath(CAShapeLayer.strokeEnd))
        strokeEnd.keyTimes = [ 0, 0.5, 1 ]
        strokeEnd.values = [ 0.1, 0.725, 0.1 ]
        strokeEnd.timingFunctions = [ ease, ease ]

        let fillRotate = CAKeyframeAnimation(keyPath: "transform.rotation.z")
        fillRotate.keyTimes = [ 0, 0.5, 1 ]
        fillRotate.values = [ 0, 0.5 * .pi, 2.0 * .pi ]
        fillRotate.timingFunctions = [ ease, ease ]

        morph.animations = [ strokeEnd, fillRotate ]
        morph.duration = 1.75
        morph.repeatCount = .infinity

        rotate.fromValue = 0
        rotate.toValue = 2.0 * .pi
        rotate.duration = 2.25
        rotate.repeatCount = .infinity

        updateSize()
        updateProgress()
    }

    func ring(_ thickness: CGFloat) -> CGPath {
        return UIBezierPath(
            arcCenter: CGPoint(x: bounds.width / 2, y: bounds.height / 2),
            radius: (min(bounds.width, bounds.height) - thickness) / 2,
            startAngle: -0.5 * .pi, // angle starts to right, so move back to top
            endAngle: 1.5 * .pi,
            clockwise: true
        ).cgPath
    }
}