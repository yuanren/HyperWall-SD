require 'test_helper'

class EscalationsControllerTest < ActionController::TestCase
  setup do
    @escalation = escalations(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:escalations)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create escalation" do
    assert_difference('Escalation.count') do
      post :create, escalation: { dateTime: @escalation.dateTime, id: @escalation.id, label: @escalation.label, level: @escalation.level }
    end

    assert_redirected_to escalation_path(assigns(:escalation))
  end

  test "should show escalation" do
    get :show, id: @escalation
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @escalation
    assert_response :success
  end

  test "should update escalation" do
    put :update, id: @escalation, escalation: { dateTime: @escalation.dateTime, id: @escalation.id, label: @escalation.label, level: @escalation.level }
    assert_redirected_to escalation_path(assigns(:escalation))
  end

  test "should destroy escalation" do
    assert_difference('Escalation.count', -1) do
      delete :destroy, id: @escalation
    end

    assert_redirected_to escalations_path
  end
end
