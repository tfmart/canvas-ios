// @flow

import React from 'react'
import { GradeTab, mapStateToProps } from '../GradeTab'
import renderer from 'react-test-renderer'
import explore from '../../../../test/helpers/explore'
import { registerScreens } from '../../../routing/register-screens'

registerScreens({})
jest.mock('../components/GradePicker')
jest.mock('react-native-button', () => 'Button')

const templates = {
  ...require('../../../api/canvas-api/__templates__/rubric'),
  ...require('../../../redux/__templates__/app-state'),
  ...require('../../../__templates__/helm'),
}

let ownProps = {
  assignmentID: '1',
  courseID: '1',
  submissionID: '1',
  userID: '1',
  navigator: templates.navigator(),
}

let defaultProps = {
  ...ownProps,
  rubricItems: [templates.rubric()],
  rubricSettings: templates.rubricSettings(),
  rubricAssessment: templates.rubricAssessment(),
  gradeSubmissionWithRubric: jest.fn(),
  rubricGradePending: false,
}

describe('Rubric', () => {
  it('doesnt render anything when there is no rubric', () => {
    let props = {
      ...defaultProps,
      rubricItems: null,
    }
    let tree = renderer.create(
      <GradeTab {...props} />
    ).toJSON()

    expect(tree).toBeNull()
  })

  it('renders a rubric', () => {
    let tree = renderer.create(
      <GradeTab {...defaultProps} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('calls show with the proper route when a view description is pressed', () => {
    let tree = renderer.create(
      <GradeTab {...defaultProps} />
    ).toJSON()

    let button = explore(tree).selectByID('rubric-item.description') || {}
    button.props.onPress()

    expect(defaultProps.navigator.show).toHaveBeenCalledWith(
      `/courses/1/assignments/1/rubrics/${defaultProps.rubricItems[0].id}/description`,
      { modal: true },
    )
  })

  it('has the correct score', () => {
    let tree = renderer.create(
      <GradeTab {...defaultProps} />
    )

    tree.getInstance().setState({ ratings: { '2': 10 } })

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('shows the activity indicator when saving a rubric score', () => {
    let tree = renderer.create(
      <GradeTab {...defaultProps} rubricGradePending={true} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows the save button when there is a change in the rubric score', () => {
    let tree = renderer.create(
      <GradeTab {...defaultProps} />
    )

    let button = explore(tree.toJSON()).selectByID(`rubric-item.points-${defaultProps.rubricItems[0].ratings[0].id}`) || {}
    button.props.onPress()

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('calls gradeSubmissionWithRubric when the save button is pressed', () => {
    let tree = renderer.create(
      <GradeTab {...defaultProps} />
    )

    let circleButton = explore(tree.toJSON()).selectByID(`rubric-item.points-${defaultProps.rubricItems[0].ratings[0].id}`) || {}
    circleButton.props.onPress()

    let saveButton = explore(tree.toJSON()).selectByID('rubric-details.save') || {}
    saveButton.props.onPress()

    expect(defaultProps.gradeSubmissionWithRubric).toHaveBeenCalledWith('1', '1', '1', '1', {
      '1': {
        comments: '',
        points: 10,
      },
      '2': {
        points: 0,
      },
    })
  })
})

describe('mapStateToProps', () => {
  it('gives us the rubric items if there are any', () => {
    let rubricItems = { yo: 'yo' }
    let rubricSettings = { yoyo: 'yoyo' }
    let state = templates.appState({
      entities: {
        assignments: {
          '1': {
            data: {
              rubric: rubricItems,
              rubric_settings: rubricSettings,
            },
          },
        },
        submissions: {},
      },
    })

    let props = mapStateToProps(state, ownProps)
    expect(props.rubricItems).toEqual(rubricItems)
    expect(props.rubricSettings).toEqual(rubricSettings)
  })

  it('returns rubric assessments when there are some', () => {
    let rubricAssessment = {}
    let state = templates.appState({
      entities: {
        assignments: {
          '1': {
            data: {},
          },
        },
        submissions: {
          '1': {
            submission: {
              rubric_assessment: rubricAssessment,
            },
          },
        },
      },
    })

    let props = mapStateToProps(state, ownProps)
    expect(props.rubricAssessment).toEqual(rubricAssessment)
  })

  it('returns null when there is no submission', () => {
    let state = templates.appState({
      entities: {
        assignments: {
          '1': {
            data: {},
          },
        },
        submissions: {},
      },
    })

    let props = mapStateToProps(state, ownProps)
    expect(props.rubricAssessment).toBeNull()
  })

  it('returns the grading pending value', () => {
    let state = templates.appState({
      entities: {
        assignments: {
          '1': {
            data: {},
          },
        },
        submissions: {
          '1': {
            rubricGradePending: true,
            submission: {
              rubric_assessment: {},
            },
          },
        },
      },
    })

    let props = mapStateToProps(state, ownProps)
    expect(props.rubricGradePending).toEqual(true)
  })
})
